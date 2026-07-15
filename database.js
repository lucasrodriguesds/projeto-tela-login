const addAuditLog = async (userId, action, details) => {
  try {
    await db.collection('audit_logs').add({
      userId: userId,
      action: action,
      details: details,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    console.log("Log registrado:", action);
  } catch (error) {
    console.error("Erro ao registrar log:", error);
  }
};
