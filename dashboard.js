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
      
      let userData;
      if (userDoc.exists) {
        console.log("Dados encontrados:", userDoc.data());
        userData = userDoc.data();
      } else {
        console.warn("Documento não encontrado, criando padrão...");
        userData = {
            login: user.email.split('@')[0],
            email: user.email,
            plano: "Basico",
            avatar: "avatar_01",
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        await window.db.collection('users').doc(user.uid).set(userData);
      }
      
      document.getElementById('user-name').innerText = userData.login || 'Usuário';
      document.getElementById('user-plan').innerText = userData.plano || 'Basico';
      
      // Exibir avatar
      const avatarMap = { avatar_01: '😎', avatar_02: '🚀', avatar_03: '💡', avatar_04: '🎨' };
      document.getElementById('current-avatar').innerText = avatarMap[userData.avatar] || '👤';
      
      // Data de criação (se disponível)
      if (userData.createdAt) {
        document.getElementById('account-created').innerText = userData.createdAt.toDate().toLocaleDateString('pt-BR');
      } else {
        document.getElementById('account-created').innerText = 'Data indisponível';
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
      
      console.log("Tentando atualizar avatar para:", newAvatarId, "do usuário:", user ? user.uid : "null");
      
      try {
        if (!user) throw new Error("Usuário não autenticado");
        
        // Use set com {merge: true} para criar o documento se não existir ou atualizar se existir
        await window.db.collection('users').doc(user.uid).set({ avatar: newAvatarId }, { merge: true });
        console.log("Avatar atualizado no Firestore (via set com merge).");

        // Atualizar visualmente
        const avatarMap = { avatar_01: '😎', avatar_02: '🚀', avatar_03: '💡', avatar_04: '🎨' };
        document.getElementById('current-avatar').innerText = avatarMap[newAvatarId];
        document.getElementById('avatar-selection').style.display = 'none';
        
        // Logar ação
        console.log("Chamando addAuditLog...");
        await addAuditLog(user.uid, 'UPDATE_AVATAR', `Usuário alterou avatar para ${newAvatarId}`);
        console.log("Log registrado.");
        
        alert("Avatar atualizado!");
      } catch (error) {
        console.error("Erro ao atualizar avatar:", error);
        alert("Erro ao atualizar: " + error.message);
      }
    });
  });

  document.getElementById('logout-btn').addEventListener('click', () => {
    window.auth.signOut().then(() => {
      window.location.href = 'index.html';
    });
  });
});
