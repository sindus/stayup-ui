export const fr = {
  landing: {
    header: { signIn: 'Se connecter' },
    hero: {
      title: 'Restez à jour,',
      titleHighlight: 'sans effort',
      subtitle:
        'StayUp agrège les dernières mises à jour de vos projets GitHub et chaînes YouTube en un seul flux personnalisé.',
      ctaStart: 'Commencer gratuitement',
      ctaSignIn: 'Se connecter',
      ctaFeed: 'Mes flux',
    },
    features: {
      title: 'Deux providers, un seul flux',
      changelog: {
        title: 'Changelog GitHub',
        description:
          "Suivez les releases de vos dépôts GitHub préférés. Recevez les notes de mise à jour dès qu'une nouvelle version est publiée.",
      },
      youtube: {
        title: 'Chaînes YouTube',
        description:
          "Restez informé des dernières vidéos de vos créateurs favoris. Retrouvez titre, description et lien en un coup d'œil.",
      },
    },
    cta: {
      title: 'Prêt à centraliser votre veille ?',
      subtitleLoggedIn: 'Consultez vos flux et restez informé en temps réel.',
      subtitleGuest:
        "Créez votre compte gratuitement et ajoutez votre premier flux en moins d'une minute.",
      ctaStart: "S'inscrire",
      ctaSignIn: 'Se connecter',
      ctaFeed: 'Mes flux',
    },
    download: {
      title: 'Application de bureau',
      subtitle:
        'Installez StayUp sur votre ordinateur pour accéder à vos flux sans navigateur, avec des notifications système et un démarrage rapide.',
      macNote: 'Apple Silicon & Intel',
      winNote: '64-bit',
      linuxNote: 'AppImage',
      allVersions: 'Voir toutes les versions',
    },
  },
  nav: {
    myFeed: 'Mon flux',
    profile: 'Mon profil',
    signOut: 'Se déconnecter',
  },
  auth: {
    loginTitle: 'Connexion',
    loginSubtitle: 'Connectez-vous à votre compte StayUp',
    registerTitle: 'Créer un compte',
    registerSubtitle: 'Rejoignez StayUp pour suivre vos mises à jour',
    name: 'Nom',
    namePlaceholder: 'Votre nom',
    email: 'E-mail',
    emailPlaceholder: 'vous@exemple.com',
    password: 'Mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    signIn: 'Se connecter',
    signingIn: 'Connexion...',
    createAccount: 'Créer mon compte',
    creatingAccount: 'Inscription...',
    noAccount: 'Pas encore de compte ?',
    alreadyAccount: 'Déjà un compte ?',
    signUp: "S'inscrire",
    or: 'ou',
    continueWithGoogle: 'Continuer avec Google',
    continueWithGitHub: 'Continuer avec GitHub',
    emailInvalid: 'Adresse e-mail invalide',
    passwordRequired: 'Mot de passe requis',
    nameTooShort: 'Nom trop court (min. 2 caractères)',
    passwordTooShort: 'Mot de passe trop court (min. 8 caractères)',
    passwordMismatch: 'Les mots de passe ne correspondent pas',
  },
}

export type Translations = typeof fr
