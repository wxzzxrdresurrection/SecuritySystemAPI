import mongoose from 'Config/mongo';

const SensorSchema = new mongoose.Schema({
  nombre: String,
  active: Boolean,
})

const SensorMongo = mongoose.model('Sensore', SensorSchema);

export default SensorMongo
