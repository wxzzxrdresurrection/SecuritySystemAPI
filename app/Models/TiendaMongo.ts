import mongoose from 'Config/mongo';


const TiendaSchema = new mongoose.Schema({
  nombre: String,
  code: Number,
  user_id: Number,
})

const TiendaMongo = mongoose.model('Tienda', TiendaSchema);

export default TiendaMongo;
