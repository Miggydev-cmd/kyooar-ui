let navigateRef = null;

export const setNavigator = (navigator) => {
  navigateRef = navigator;
};

export const getNavigator = () => {
  return navigateRef;
}; 