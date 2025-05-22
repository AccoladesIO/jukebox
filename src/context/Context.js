import { createContext, useMemo } from "react";

const Context = createContext();

const ContextProvider = ({ children }) => {
    const value = useMemo(() => ({}), []);

    return (
        <Context.Provider value={value}>
            {children}
        </Context.Provider>
    );
};

export { Context, ContextProvider };