import mongoose from 'Config/mongo';

const SensorSchema = new mongoose.Schema({

  tipo: String,
  identificador: String,
  descripcion: String,
  id_casa: Number,
})

const SensorMongo = mongoose.model('Sensore', SensorSchema);

export default SensorMongo
