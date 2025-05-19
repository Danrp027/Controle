const express = require('express');
const app = express();
const path = require('path');
const db = require('./models/db'); 


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));



const produtosRoutes = require('./routes/produtos');
const pedidosRoutes = require('./routes/pedidos');
const clientesRoutes = require('./routes/clientes');
const estoqueRoutes = require('./routes/estoque');
const relatoriosRoutes = require('./routes/relatorios'); 
 


app.use('/api/produtos', produtosRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/estoque', estoqueRoutes);
app.use('/relatorios', relatoriosRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
