import mongoose from "mongoose";
import { RegisterUserRequest } from "@amaarhassancs/dusk-protos/dist/proto/users/user";

interface CustomerDto extends RegisterUserRequest {
  password: string;
  verifyToken: string;
  isVerified: boolean;
  resetToken?: string;
  resetTokenExpires?: Date;
}

const customerSchema = new mongoose.Schema<CustomerDto, CustomerDto>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: ["CUSTOMER"],
      required: true,
      default: "CUSTOMER",
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please add password"],
      minlength: 6,
    },
    isVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    verifyToken: {
      type: String,
      required: true,
    },
    resetToken: String,
    resetTokenExpires: Date,
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
    timestamps: true,
  }
);

// Adding indexes (ideally should be part of migration files)
customerSchema.index({ _id: 1, isVerified: 1 });
customerSchema.index({ _id: 1, verifyToken: 1 });
customerSchema.index({ email: 1, role: 1 });
customerSchema.index({ resetToken: 1, resetTokenExpires: 1 });

const CustomerModel = mongoose.model("Customer", customerSchema);

export default CustomerModel;
