import {createContext, ReactNode, RefObject, useMemo} from 'react';
import { Text } from 'react-native';



export const TextRefContext = createContext<Array<RefObject<Text>>>([]); 


export default function TextRefProvider({children}:{children:ReactNode}){
   
   let textRefArray = useMemo(() => [],[]);

  return <TextRefContext.Provider value = {textRefArray}>
     {children}
   </TextRefContext.Provider>


}
