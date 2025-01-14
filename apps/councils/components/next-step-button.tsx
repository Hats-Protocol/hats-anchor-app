interface NextStepButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  type?: 'button' | 'submit';
  withIcon?: boolean;
}

export function NextStepButton({ onClick, disabled, children, type = 'submit', withIcon = true }: NextStepButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className='inline-flex items-center rounded-full bg-[#2B6CB0] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50'
    >
      {children}
      {withIcon && (
        <svg className='ml-2 h-4 w-4' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
          <path
            fillRule='evenodd'
            clipRule='evenodd'
            d='M1 8C1 11.866 4.13401 15 8 15C11.866 15 15 11.866 15 8C15 4.13401 11.866 1 8 1C4.13401 1 1 4.13401 1 8ZM16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8ZM4.5 7.5C4.22386 7.5 4 7.72386 4 8C4 8.27614 4.22386 8.5 4.5 8.5H10.2929L8.14645 10.6464C7.95118 10.8417 7.95118 11.1583 8.14645 11.3536C8.34171 11.5488 8.65829 11.5488 8.85355 11.3536L11.8536 8.35355C12.0488 8.15829 12.0488 7.84171 11.8536 7.64645L8.85355 4.64645C8.65829 4.45118 8.34171 4.45118 8.14645 4.64645C7.95118 4.84171 7.95118 5.15829 8.14645 5.35355L10.2929 7.5H4.5Z'
            fill='currentColor'
          />
        </svg>
      )}
    </button>
  );
}
