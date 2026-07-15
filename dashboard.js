document.addEventListener('DOMContentLoaded', () => {
  console.log("Dashboard carregando...");
  window.auth.onAuthStateChanged(async (user) => {
    console.log("Estado de autenticação alterado:", user);
    if (!user) {
      console.log("Usuário não logado, redirecionando...");
      window.location.href = 'index.html';
      return;
    }

    try {
      console.log("Buscando dados do usuário no Firestore...");
      // Preencher nome e dados básicos do Firestore
      const userDoc = await window.db.collection('users').doc(user.uid).get();
      if (userDoc.exists) {
        console.log("Dados encontrados:", userDoc.data());
        const userData = userDoc.data();
        document.getElementById('user-name').innerText = userData.login || 'Usuário';
        document.getElementById('user-plan').innerText = userData.plano || 'Basico';
        
        // Data de criação (se disponível)
        if (userData.createdAt) {
          document.getElementById('account-created').innerText = userData.createdAt.toDate().toLocaleDateString('pt-BR');
        }
      } else {
        console.warn("Documento do usuário não encontrado no Firestore!");
      }
      
      // Último acesso (do Firebase Auth)
      document.getElementById('last-access').innerText = new Date(user.metadata.lastSignInTime).toLocaleString('pt-BR');
      
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
    }
  });

  document.getElementById('logout-btn').addEventListener('click', () => {
    window.auth.signOut().then(() => {
      window.location.href = 'index.html';
    });
  });
});
