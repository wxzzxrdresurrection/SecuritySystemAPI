import SensorMongo from "./SensorMongo";
import mongoose from "mongoose";

const SensorValorSchema = new mongoose.Schema({
  sensor: SensorMongo,
  valor: Number,
  fecha: Date,
  
})

const SensorValorMongo = mongoose.model('valore', SensorValorSchema);

export default SensorValorMongo
