export const isDomainError = (err, code) => {
  if (!err) return false;
  return String(err.message || err) === code;
};

export const domainErrorMessageFr = (code) => {
  switch (code) {
    case 'ALREADY_VALIDATED':
      return 'Cette journée a déjà été validée.';
    case 'FUTURE_DAY':
      return 'Impossible de valider un jour futur.';
    case 'HABIT_COMPLETED':
      return 'Habitude terminée : lecture seule.';
    case 'HABIT_ARCHIVED':
      return 'Habitude archivée.';
    case 'BEFORE_START':
      return "Cette date est avant le début de l'habitude.";
    case 'AFTER_END':
      return 'Cycle terminé.';
    case 'INVALID_EXPORT':
      return 'Fichier invalide.';
    case 'UNSUPPORTED_SCHEMA':
      return 'Version de sauvegarde non supportée.';
    case 'IMPORT_READ_FAIL':
      return 'Impossible de lire le fichier.';
    default:
      return 'Action impossible.';
  }
};
