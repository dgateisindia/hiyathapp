import express from "express";
import { protect } from "../middleware/auth";
import { addAddress, deleteAddress, getAddresses, updateAddress } from "../controllers/addressController";

const AddressRouter = express.Router()

AddressRouter.get('/', protect, getAddresses)
AddressRouter.post('/', protect, addAddress)
AddressRouter.put('/', protect, updateAddress)
AddressRouter.delete('/', protect, deleteAddress)

export default AddressRouter;