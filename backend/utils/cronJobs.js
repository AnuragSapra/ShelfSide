import cron from "node-cron";
import Borrow from "../models/borrow.js";
import Book from "../models/book.js";

export function startCronJobs() {
  cron.schedule("0 0 * * *", async () => {
    console.log(
      "[Shelfside Cron Core]: Initializing midnight library auditing routine workers...",
    );

    try {
      const today = new Date();

      const activeOverdueLoans = await Borrow.find({
        status: "collected",
        dueDate: { $lt: today },
      });

      if (activeOverdueLoans.length > 0) {
        console.log(
          `[Cron Job 1]: Computing daily fine updates for ${activeOverdueLoans.length} late accounts...`,
        );

        const finePromises = activeOverdueLoans.map((request) => {
          const millisecondsLate = today.getTime() - request.dueDate.getTime();
          const numericalDaysLate = Math.ceil(
            millisecondsLate / (1000 * 60 * 60 * 24),
          );

          request.fine = numericalDaysLate * 2;
          return request.save();
        });

        await Promise.all(finePromises);
      }

      const expiredPickups = await Borrow.find({
        status: "ready",
        pickupDeadline: { $lt: today },
      });

      if (expiredPickups.length > 0) {
        console.log(
          `[Cron Job 2]: Reclaiming ${expiredPickups.length} abandoned book hold reservations...`,
        );

        const cancellationPromises = expiredPickups.map((request) => {
          request.status = "cancelled";
          request.rejectionReason =
            "Hold reservation expired. Asset auto-returned to shelves due to pickup deadline lapse.";

          return Promise.all([
            request.save(),
            Book.findByIdAndUpdate(request.book, {
              $inc: { availableCopies: 1 },
            }),
          ]);
        });

        await Promise.all(cancellationPromises.flat());
      }

      console.log(
        "[Shelfside Cron Core]: System cleanup and auditing procedures completed successfully.",
      );
    } catch (error) {
      console.error(
        "[Shelfside Cron Error]: Midnight automated routines encountered a runtime crash:",
        error,
      );
    }
  });
}
