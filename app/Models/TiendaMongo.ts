import mongoose from 'Config/mongo';


const TiendaSchema = new mongoose.Schema({
  altid: Number,
  nombre: String,
  code: Number,
})

const TiendaMongo = mongoose.model('Tienda', TiendaSchema);

export default TiendaMongo;
