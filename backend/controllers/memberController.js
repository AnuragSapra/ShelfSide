import bcrypt from "bcryptjs";
import User from "../models/user.js";
import Counter from "../models/counter.js";
import Borrow from "../models/borrow.js";

export async function handleCreateMember(req, res) {
  const { name, email, password, phone, address } = req.body;

  const requiredFields = ["name", "email", "password", "phone", "address"];
  const missingFields = requiredFields.filter(
    (field) => !req.body[field] || String(req.body[field]).trim() === "",
  );

  if (missingFields.length > 0) {
    const isPlural = missingFields.length > 1;
    return res.status(400).json({
      message: `All fields are mandatory. ${missingFields.join(",")} ${isPlural ? "are" : "is"} missing`,
    });
  }
  if (password.length < 8 || password.length > 13) {
    return res.status(400).json({
      message: "Password must be between 8-13 characters long. ",
    });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "User already exists!",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const counter = await Counter.findOneAndUpdate(
      { id: "member_sequence" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    );

    const paddedNumber = String(counter.seq).padStart(4, "0");

    const generatedMemberId = `SS-DEL-${paddedNumber}`;

    const member = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      memberId: generatedMemberId,
      role: "member",
      isFirstLogin: true,
    });

    return res.status(201).json({
      message: "New Member has been added successfully.",
      memberId: member.memberId,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email already exists." });
    }
    return res.status(500).json({ message: "Internal server error." });
  }
}

export async function getAllMembers(req, res) {
  try {
    const { showInactive } = req.query;
    const filter =
      showInactive === "true"
        ? { role: "member" }
        : { role: "member", isActive: true };

    const members = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });
    return res.status(200).json({ members });
  } catch (error) {
    return res.status(500).json({
      message: "Couldn't fetch members",
    });
  }
}

export async function getMemberById(req, res) {
  const memberId = req.params.memberId;
  if (!memberId) {
    return res.status(400).json({
      message: "Member Id param is required",
    });
  }
  try {
    const member = await User.findOne({ memberId, role: "member" }).select(
      "-password",
    );
    if (!member) {
      return res.status(404).json({
        message: "No member found with this memberId",
      });
    }
    return res.status(200).json({ member });
  } catch (error) {
    return res.status(500).json({
      message: "Couldn't fetch the member",
    });
  }
}

export async function updateMember(req, res) {
  const memberId = req.params.memberId;
  if (!memberId) {
    return res.status(400).json({
      message: "Member Id param is required",
    });
  }

  const { name, email, phone, address } = req.body;
  const allowedFields = { name, email, phone, address };
  const updateFields = {};
  Object.keys(allowedFields).forEach((key) => {
    if (
      allowedFields[key] !== undefined &&
      String(allowedFields[key]).trim() !== ""
    ) {
      updateFields[key] = allowedFields[key];
    }
  });

  try {
    const updatedMember = await User.findOneAndUpdate(
      { memberId },
      { $set: updateFields },
      { new: true, runValidators: true },
    ).select("-password");

    if (!updatedMember) {
      return res.status(404).json({
        message: "No member found with this memberId",
      });
    }

    return res.status(200).json({
      message: "The member details were updated successfully.",
      updatedMember,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "Conflict: This email address is already registered to another user profile.",
      });
    }
    return res.status(500).json({
      message: "Couldn't update member details",
    });
  }
}

export async function handleDeactivateMember(req, res) {
  const memberId = req.params.memberId;
  if (!memberId) {
    return res.status(400).json({
      message: "Member Id param is required",
    });
  }
  try {
    const member = await User.findOne({ memberId, role: "member" });
    if (!member) {
      return res.status(404).json({
        message: "No member found with this memberId",
      });
    }

    const activeBorrows = await Borrow.findOne({
      user: member._id,
      status: { $in: ["pending", "approved", "ready", "collected"] },
    });

    if (activeBorrows) {
      return res.status(400).json({
        message: "Cannot deactivate member with active borrows.",
      });
    }

    member.isActive = false;

    await member.save();

    return res.status(200).json({
      message: "Member account has been deactivated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

export async function handleReactivateMember(req, res) {
  const memberId = req.params.memberId;
  if (!memberId) {
    return res.status(400).json({
      message: "Member Id param is required",
    });
  }
  try {
    const member = await User.findOne({ memberId, role: "member" });
    if (!member) {
      return res.status(404).json({
        message: "No member found with this memberId",
      });
    }

    if (member.isActive) {
      return res.status(400).json({
        message: "Member is already active.",
      });
    }

    const activeBorrows = await Borrow.findOne({
      user: member._id,
      status: "collected",
    });

    if (activeBorrows) {
      return res.status(400).json({
        message: "Member must return all borrowed books before reactivation.",
      });
    }

    member.isActive = true;

    await member.save();

    return res.status(200).json({
      message: "Member account has been reactivated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      member,
    });
  }
}
