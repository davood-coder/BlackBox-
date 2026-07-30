type NavigationLike = {
  canGoBack?: () => boolean;
  goBack: () => void;
  navigate: (route: string, params?: unknown) => void;
};

export function goBackOrNavigate(navigation: NavigationLike, fallbackRoute: string, fallbackParams?: unknown) {
  if (navigation.canGoBack?.()) {
    navigation.goBack();
    return;
  }

  navigation.navigate(fallbackRoute, fallbackParams);
}
