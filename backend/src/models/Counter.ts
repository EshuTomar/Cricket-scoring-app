import mongoose, { type Document, Schema } from "mongoose"

export interface ICounter extends Document {
  name: string
  value: number
}

const CounterSchema = new Schema<ICounter>({
  name: { type: String, required: true, unique: true },
  value: { type: Number, required: true, default: 1000 },
})

export default mongoose.model<ICounter>("Counter", CounterSchema)
