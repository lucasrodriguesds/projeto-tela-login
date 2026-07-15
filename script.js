// Firebase setup is handled in firebase-config.js
// auth and db are available globally

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  const passwordInput = document.getElementById('password');
  const strengthBar = document.getElementById('password-strength-bar');

  // Função para calcular a força da senha
  const calculateStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[!@#$%^&*]/.test(password)) strength += 25;
    return strength;
  };

  // Evento para atualizar a barra de força em tempo real
  if (passwordInput && strengthBar) {
    passwordInput.addEventListener('input', () => {
      const strength = calculateStrength(passwordInput.value);
      strengthBar.style.width = strength + '%';
      
      if (strength <= 25) strengthBar.style.backgroundColor = '#ef4444'; // Vermelho
      else if (strength <= 50) strengthBar.style.backgroundColor = '#f59e0b'; // Laranja
      else if (strength <= 75) strengthBar.style.backgroundColor = '#3b82f6'; // Azul
      else strengthBar.style.backgroundColor = '#10b981'; // Verde
    });
  }

  if (!form) return;

  // Função para limpar erros
  const clearErrors = () => {
    document.querySelectorAll('.error-message').forEach(el => el.innerText = '');
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();
    
    const submitBtn = document.getElementById('submit-btn');
    const spinner = document.getElementById('btn-spinner');
    const btnText = document.getElementById('btn-text');
    
    spinner.style.display = 'inline-block';
    btnText.innerText = 'Processando...';
    submitBtn.disabled = true;

    // Identificar se é página de Login ou Cadastro pelo título do h2
    const title = document.querySelector('h2').innerText;
    let isValid = true;
    
    if (title === "Login") {
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
        try {
          const userCredential = await signIn(email, password);
          console.log("Autenticação bem-sucedida!");
          await addAuditLog(userCredential.user.uid, 'LOGIN', `Usuário ${email} logou com sucesso.`);
          alert("Login realizado com sucesso!");
          localStorage.setItem('loggedUser', email);
          window.location.href = "dashboard.html";
        } catch (error) {

        document.getElementById('password-error').innerText = "E-mail ou senha incorretos ou erro de conexão.";
        isValid = false;
      }
      
    } else if (title === "Cadastro") {
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      // Validação de Senha: Pelo menos uma maiúscula e um caractere especial
      const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;
      
      if (!passwordRegex.test(password)) {
        document.getElementById('password-error').innerText = "A senha deve conter pelo menos 8 caracteres, uma letra maiúscula e um caractere especial.";
        isValid = false;
      }

      if (isValid) {
        try {
          console.log("Iniciando autenticação...");
          const userCredential = await signUp(email, password);
          console.log("Autenticação bem-sucedida!");
          
          // Salvar dados adicionais no Firestore usando o UID como ID do documento
          console.log("Tentando salvar no Firestore...");
          const login = document.getElementById('login').value;
          await window.db.collection('users').doc(userCredential.user.uid).set({
            login: login,
            email: email,
            plano: "Basico",
            avatar: "avatar_01",
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });
          console.log("Dados salvos no Firestore com sucesso!");
          await addAuditLog(userCredential.user.uid, 'SIGNUP', `Usuário ${email} cadastrado com sucesso.`);

          alert("Cadastro realizado com sucesso!");
          window.location.href = "index.html"; // Redirecionar para o login
        } catch (error) {
          console.error("Erro completo:", error);
          document.getElementById('email-error').innerText = "Erro no cadastro: " + error.message;
          isValid = false;
        }
      }
    }

    if (!isValid) {
      spinner.style.display = 'none';
      btnText.innerText = title === "Login" ? "Entrar" : "Cadastrar";
      submitBtn.disabled = false;
    }
  });
});
