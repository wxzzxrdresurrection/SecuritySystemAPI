import mongoose from "mongoose";

const SensorValorSchema = new mongoose.Schema({
  sensor: {
    tipo: String,
    identificador: String,
    descripcion: String,
    id_casa: Number,
  },
  valor: Number,
  fecha: Date,
})

const SensorValorMongo = mongoose.model('valore', SensorValorSchema);

export default SensorValorMongo
