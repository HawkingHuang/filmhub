export type ToastPayload = {
  title: string;
  description?: string;
};

export type UseToggleFavoriteOptions = {
  onToast?: (payload: ToastPayload) => void;
};
