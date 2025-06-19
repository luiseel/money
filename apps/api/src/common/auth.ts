export type AuthRequest = Request & {
  user: {
    sub: string;
  };
};
