import create from 'zustand';

export const useUserStore = create( (set) => ({
    user: {},
    isUser: false,
    setUser: (user) => {set({user})},
    setIsUser: (isUser) => {set({isUser})}
}));