type HatProposals = {
  [hatId: string]: {
    [proposalId: number]: {
      elect: string;
      execute?: string;
    };
  };
};

const SepoliaProposals: HatProposals = {
  '56.1.9': {
    107187481: {
      elect: '0xb7297d8e3e89d97e5c62abf98daf4382bb07623971bc47d77a4f16bf6109fbf3',
    },
  },
};

const MainnetProposals: HatProposals = {
  // Superrare (not used currently)
  '22.1.2': {
    107187481: {
      elect: '0x1422c81c64fd3928f5c344c970ebe96e904a60d26900e64fd9808731c11a8e8a',
    },
  },
};

export const PROPOSALS: { [chainId: number]: HatProposals } = {
  1: {
    ...MainnetProposals,
  },
  11155111: {
    ...SepoliaProposals,
  },
};
