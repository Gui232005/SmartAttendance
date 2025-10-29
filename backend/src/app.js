const express=require('express'); const cors=require('cors');
const { sequelize } = require('./db');
require('./models/funcionario'); require('./models/evento');

const app=express(); app.use(cors()); app.use(express.json());
app.use('/api', require('./routes'));

(async()=>{ await sequelize.sync(); console.log('DB pronta'); })();

app.get('/',(_ ,res)=> res.send('Backend OK'));
const PORT=process.env.PORT||3001;
app.listen(PORT,()=>console.log(`API http://localhost:${PORT}`));
