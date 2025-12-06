const customSelectStyles = {
    control: (provided, state) => ({
        ...provided,
        backgroundColor: 'var(--color-colors-secondary)',
        border: 'none !important',
        color: 'var(--color-colors-neutralText)',
        minHeight: '38px',
        borderRadius: '15px',
        boxShadow: 'none',
        width: '100%',
        paddingTop: '5px'
    }),

    multiValue: (provided) => ({
        ...provided,
        backgroundColor: 'var(--color-colors-primaryAccent)',
        color: 'var(--color-colors-neutralText)',
        borderRadius: '8px',
    }),

    multiValueLabel: (provided) => ({
        ...provided,
        color: 'var(--color-colors-neutralText)',
        fontWeight: '500',
    }),

    multiValueRemove: (provided) => ({
        ...provided,
        color: 'white',
        ':hover': {
            backgroundColor: 'var(--color-colors-danger)',
            color: 'white',
        },
    }),

    placeholder: (provided) => ({
        ...provided,
        color: 'var(--color-colors-neutralText)',
    }),

    singleValue: (provided) => ({
        ...provided,
        color: 'var(--color-colors-neutralText)',
    }),

    menu: (provided) => ({
    ...provided,
    backgroundColor: 'var(--color-colors-secondary)',
    color: 'var(--color-colors-neutralText)',
    borderRadius: '10px',
    scrollbarColor: '#1e7df8 var(--color-colors-secondary)',
    scrollbarWidth: 'thin',
    Height: 'auto',
    // Height: '100px',
    // overflowY: 'auto',
    // zIndex: 9999,
    // position: 'relative',
    //  maxHeight: '150px', // ✅ correct height prop
  overflowY: 'auto',
  position: 'absolute',
  zIndex: 10, 
    
  }),

    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isFocused
            ? 'var(--color-colors-primaryAccent)'
            : 'var(--color-colors-secondary)',
        color: 'white',
        cursor: 'pointer',
    }),

    dropdownIndicator: (provided) => ({
        ...provided,
        color: 'var(--color-colors-neutralText)',
        padding: '8px',
    }),

    indicatorSeparator: () => ({
        display: 'none',
    }),

    valueContainer: (provided) => ({
        ...provided,
        flexWrap: 'wrap',
        maxHeight: '36px',
        overflowY: 'auto',
        // overflowX: 'hidden',

    }),
    menuPortal: (base) => ({
        ...base,
        zIndex: 9999,
        // position:'relative'
    }),
};

export default customSelectStyles;
