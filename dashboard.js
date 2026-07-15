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
        
        // Exibir avatar
        const avatarMap = { avatar_01: '😎', avatar_02: '🚀', avatar_03: '💡', avatar_04: '🎨' };
        document.getElementById('current-avatar').innerText = avatarMap[userData.avatar] || '👤';
        
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

  // Lógica para alternar exibição da seleção de avatar
  document.getElementById('toggle-avatar-btn').addEventListener('click', () => {
    const selection = document.getElementById('avatar-selection');
    selection.style.display = selection.style.display === 'none' ? 'block' : 'none';
  });

  // Lógica para selecionar novo avatar
  document.querySelectorAll('.avatar-option').forEach(btn => {
    btn.addEventListener('click', async () => {
      const newAvatarId = btn.getAttribute('data-id');
      const user = window.auth.currentUser;
      
      try {
        await window.db.collection('users').doc(user.uid).update({ avatar: newAvatarId });
        // Atualizar visualmente
        const avatarMap = { avatar_01: '😎', avatar_02: '🚀', avatar_03: '💡', avatar_04: '🎨' };
        document.getElementById('current-avatar').innerText = avatarMap[newAvatarId];
        document.getElementById('avatar-selection').style.display = 'none';
        
        // Logar ação
        await addAuditLog(user.uid, 'UPDATE_AVATAR', `Usuário alterou avatar para ${newAvatarId}`);
        alert("Avatar atualizado!");
      } catch (error) {
        console.error("Erro ao atualizar avatar:", error);
      }
    });
  });

  document.getElementById('logout-btn').addEventListener('click', () => {
    window.auth.signOut().then(() => {
      window.location.href = 'index.html';
    });
  });
});
