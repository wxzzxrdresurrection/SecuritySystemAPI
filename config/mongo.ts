import Env from '@ioc:Adonis/Core/Env'
import mongoose from 'mongoose'


mongoose.connect(
  Env.get('MONGO_URL1', 'mongodb://localhost:27017/adonis')).then(() => {
    console.log('MongoDB Connected')
  }).catch(
    () =>{
      mongoose.connect(
        Env.get('MONGO_URL2', 'mongodb://localhost:27018/adonis')).then(() => {
          console.log('MongoDB Connected')
        }).catch(
          () =>{
            mongoose.connect(
              Env.get('MONGO_URL3', 'mongodb://localhost:27019/adonis')).then(() => {
                console.log('MongoDB Connected')
              }).catch(

                () =>{
                  mongoose.connect(
                    Env.get('MONGO_URL1', 'mongodb://localhost:27017/adonis')).then(() => {
                      console.log('MongoDB Connected')
                    }).catch(err => console.log(err))
                }
              )
              
          }

        )
    }

  )

export default mongoose


