import Env from '@ioc:Adonis/Core/Env'
import mongoose from 'mongoose'


mongoose.connect(
  Env.get('MONGO_URL', 'mongodb://localhost:27017/adonis')).then(() => {
    console.log('MongoDB Connected')
  }).catch(err => console.log(err))


export default mongoose


