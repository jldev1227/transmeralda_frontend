export const selectStyles = {
    control: (provided: any) => ({
      ...provided,
      backgroundColor: "#f4f4f5",
      border: "none",
      borderRadius: "12px",
      padding: "11px",
      boxShadow: "none",
      "&:hover": {
        backgroundColor: "#e4e4e7",
      },
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? "#D1F4E0" : "white",
      color: state.isSelected ? "black" : "black",
      "&:hover": {
        backgroundColor: "#e6f7ff",
      },
      opacity: 1,
      zIndex: 10,
    }),
    menu: (provided: any) => ({
      ...provided,
      borderRadius: "8px",
      marginTop: "4px",
      zIndex: 100,
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: "#333",
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: "#999",
    }),
  };