const UsuariosModel = require('../models/UsuariosModel'); // Ajuste o caminho se necessário

async function testCreateUser() {
  try {
    const user = await UsuariosModel.create({
      firstname: 'João',
      surname: 'Silva',
      email: 'joaosilva@example.com',
      password: 'SenhaSegura123!' // Mais de 6 caracteres
    });

    console.log('Usuário criado com sucesso:', user);
  } catch (error) {
    console.error('Erro ao criar usuário:', error.message);
    // Para ver mais detalhes do erro (incluindo SQL e validações):
    // console.error(error);
  }
}

testCreateUser();