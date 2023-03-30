import { useEffect, useRef, useState,memo, useMemo,  useContext } from "react";
import {  Alert, Dimensions, ImageBackground, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";


import * as DocumentPicker from 'expo-document-picker';
import * as Speech from 'expo-speech';
import  RollingText  from 'react-native-rolling-text'

import { TextRefContext } from "./TextRefProvider";

const wq = "Born and raised in New Delhi, Kohli trained in West Delhi Cricket Academy; started his youth career with Delhi Under-15 team. Kohli made his international debut in 2008 and quickly became a key player in the ODI team. He made his Test debut in 2011. In 2013, Kohli reached the number one spot in the ICC rankings for ODI batsmen for the first time. During 2014 T20 World Cup, he set a record for the most runs scored in the tournament. In 2018, he achieved yet another milestone, becoming the world's top-ranked Test batsman, making him the only Indian cricketer to hold the number one spot in all three formats of the game. His form continued"
let str = "";
// for(let i = 0;i < 6; i++)
    str += wq;

type AudioButtonName = 'Get Audio' | 'Fetching...';
type AudioResponse = {
  body:string;
  error?:string;
} 




let prevPage = 1;


export default function Home(){
     
     const LIMIT = 30;
     const [PDF,setPDF] = useState<DocumentPicker.DocumentResult>();
     const [pageNumber,setPageNumber] = useState(1);
     const [audioButtonContent,setAudioButtonContent] = useState<AudioButtonName>('Get Audio');
     const [playing,setPlaying] = useState(false);
     const [textWords,setTextWords] = useState<string[]>([]); 
     const [limit,setLimit] = useState(LIMIT);
     
     

    
    
     const textIndex = useRef<number>(0); 
     const WORDS = useRef<string[]>([]);
     const index = useRef<number>(0);
     const scrollRef = useRef<ScrollView>(null);
     const pause = useRef(false);

     const textRefArray = useContext(TextRefContext); 
     
     


  
       const Cancel = () => {
          Speech.stop();
          setPlaying(false)
          setLimit(LIMIT);
          setPDF(undefined);
          setPageNumber(1);
          index.current = 0;
          pause.current = false;
          textIndex.current = 0;
         setTextWords([]);
         WORDS.current = [];
         prevPage = 1;
        while(textRefArray.length > 0)
             textRefArray.pop();
    } 

    

    const onPlayandPause = () => {
      if(playing){
        pause.current = true 
        setPlaying(false);
      }else setPlaying(true);
    }

    useEffect(() => {
       return () => {Speech.stop();} 
    },[])
    
    

    useEffect(() => {
      
       if(WORDS.current[index.current] === undefined)
          return;
      
       if(!playing){
         Speech.stop(); //TODO adding pause functionality
         textIndex.current = Math.max(textIndex.current - 2,0);
      }
      
      if(playing){
         const text = pause.current ?  textWords.slice(textIndex.current,limit).join(" ") : WORDS.current[index.current];
        Speech.speak( 
             text,
        {
           onStart:() => { pause.current = false; scrollRef.current?.scrollToEnd({animated:true});},
          
           onDone:() => {
           
               index.current++;
              
            if(index.current >= WORDS.current.length)
               { 
                index.current = 0;
                  textIndex.current = 0;
                  setPlaying(false); 
                 return Alert.alert("Congrats you completed this page",undefined,[{text:'Great Thanks :)'}]);
               }
             else setLimit(p => p + LIMIT);
             
          },
           onBoundary:() => {

            if(textIndex.current < textRefArray.length){
                 textRefArray[textIndex.current++].current?.setNativeProps({
                   style:{opacity:1}
               })}
        }
    })
  }
  },[playing,limit]); 

  
 
  useEffect(() => {
    if(textWords.length === 0)
        return;
     
     for(let i = 0;i < str.length; i += LIMIT)
        WORDS.current.push(textWords.slice(i,i + LIMIT).join(" "));

       WORDS.current = WORDS.current.filter((word) => word !== "");

         
  },[textWords])

 useEffect(() => {
  
  return () => {
          Speech.stop();
          setPlaying(false)
          setLimit(LIMIT);
          index.current = 0;
          pause.current = false;
          textIndex.current = 0;
          setTextWords([]);
          WORDS.current = [];
           while(textRefArray.length > 0)
             textRefArray.pop();
  }

 },[pageNumber])



     const handleFile = async () => {
         
          if(PDF && PDF?.type === 'success' && textWords.length > 0) 
          {  
             return Alert.alert("One pdf is already selected press Cancel and select other PDF",undefined,[{text:'Ok'}]);
           }

          try{

       let result = await DocumentPicker.getDocumentAsync({ type: "application/pdf" });
        
        if(result.type === 'success'){
          setPDF(result);
        }
           
        
     }catch(e){ }
      
          

      }
   

    const fetchAudio = async () => {
         
         if(!PDF)
           return Alert.alert('Select a pdf file',undefined,[{text:'Ok'}]);
         
         if(PDF.type != 'success') 
           return;    
      
         if(PDF && PDF?.type === 'success' && textWords.length > 0 && prevPage === pageNumber){
           return Alert.alert(`page number ${pageNumber} already present and ready, select another page number to continue`,undefined,[{text:'Ok'}]);
         }  
        

         try { 
         const PdfFormData = new FormData();


          const {uri,name} = PDF;
              PdfFormData.append('PDF',{
                   uri,
                   type:'application/pdf',
                   name
              }); 
         
          
          
          setAudioButtonContent('Fetching...');
       
        

         const res = await fetch(`http://*****************/post/${pageNumber}`,{
            method:'POST',
            headers: {'Content-Type': 'multipart/form-data'},            
            body:PdfFormData
         })
         const text = await res.json() as AudioResponse; 
        
         if(res.status == 400){
                setAudioButtonContent('Get Audio');
                return Alert.alert('Congrats you completed the whole Book :)',
                undefined,
                [{text:'OK'}]
              )
         } 
         
         if(res.status === 404){
            setAudioButtonContent('Get Audio');
             

            return Alert.alert('Something went wrong :(',
                  text.error 
                ,
                [{text:'Try again'}]
            )
         }
     
      
         
         
          prevPage = pageNumber;
          setTextWords(text.body.split(" ").filter((word) => word !== ""));
      
        // await new Promise((res,rej) => setTimeout(() => { 
            
        //     setTextWords(str.split(" ").filter((word) => word !== "")); 
        //     res('done');
        //   },1000))
    
        
         setAudioButtonContent('Get Audio');
                 
       }catch(e) {
            setAudioButtonContent('Get Audio');
           

          return Alert.alert('Something went wrong :(',
         
                  e.message,
         
               [{text:'Try again'}]
            )
       }

    }


  
 


	return(
      <>
        <ScrollView className="w-full flex-1"  ref = {scrollRef} >
        <View className="flex-1" style={{height:Dimensions.get("screen").height}}>
          <ImageBackground 
              source = {require('../assets/back.gif')} 
              className="flex-1 justify-center items-center"
              
            >
          
            <TouchableOpacity 
                  className='h-[150px] w-[150px] border-8 rounded-[30px] justify-center items-center' 
                   onPress = {handleFile}> 
                   <Text className = 'text-[20px] font-bold'  
                     numberOfLines={1}
                     ellipsizeMode="tail" 
                   >  
                       { PDF && PDF.type === 'success'? PDF.name : "Select Pdf" } 
                  </Text>
              </TouchableOpacity>
            
          { 

            PDF && PDF.type === "success" ?  

             <TextInput className="px-6 py-2 rounded-[20px] bg-black mt-4 text-white text-[15px]"
               cursorColor={'black'}
               inputMode = "numeric"
               placeholder="select page"
               placeholderTextColor={'lightgray'}
               onChangeText={value => setPageNumber(parseInt(value))}
               
             /> : 
             null
           } 
               <TouchableOpacity className="rounded-[50px] bg-black mt-6"
                 onPress={fetchAudio}
                 disabled = {audioButtonContent === 'Fetching...'}
                 
               > 
                    <Text 
                      className = 'px-14 py-4 text-[20px] font-bold flex justify-center items-center  text-red-400'
                       style={{opacity:audioButtonContent === 'Fetching...' ? 0.7 : 1}}
                      > 
                         {audioButtonContent}
                     </Text>
               </TouchableOpacity>
            
           {
               textWords.length > 0 ?
                 <>
               <View className="flex-row mt-8 justify-center w-[100%]"> 
                  
                  
                <TouchableOpacity className=" mx-3 bg-black flex justify-center items-center  rounded-[15px]"
                    onPress = {Cancel}
                  > 
                    <Text className=" text-red-400 text-[20px] font-bold px-5 py-2">
                     cancel
                     </Text>
                  </TouchableOpacity>
               
               </View>
                
               
            
              
               
               </> 
               : 
               null
           }
          


          </ImageBackground>
            
             
                
          </View>
    <View  
       className={`flex-1 w-full flex-row flex-wrap justify-start bg-red-400 ${textWords.length > 0 && 'mb-20'}`} 
       > 
                {
                    textWords.slice(0,limit).map((word,index) => {
                         return <Words key={index} word={word} />
                    })
                             
              }


  </View>
                  
        </ScrollView>

        { textWords.length > 0 ?
          
          <View className="absolute z-0 bottom-[8px] h-16 w-[90%]    flex  flex-row items-center"
            style = {{
             backgroundColor:'rgb(220,113,113)', 
             borderRadius:40,
             shadowColor:'black',
             shadowOffset:{height:15,width:15},
             elevation:6,
             borderWidth:5,
             borderColor:'rgb(248,113,113)'
               
            }}
          >
            <TouchableOpacity 
                className="flex ml-5 justify-center items-center  rounded-[15px] bg-black"
                onPress = {onPlayandPause}
            >
             <Text className="text-red-400 text-[15px] font-bold px-6 py-2"> 
                {playing ? 'pause' : 'play'} 
            </Text>
          </TouchableOpacity>
          <Pressable className="ml-5 w-[180px] overflow-hidden"
             onPress={() => scrollRef.current?.scrollTo({x:0,y:0,animated:true})}
           >
           <RollingText delay={400} style={{fontSize:35,fontWeight:"bold",overflow:"hidden"}} durationMsPerWidth={10} startDelay={10} >
               {PDF?.type === 'success' ? PDF.name : 'No Name'}
           </RollingText>
          </Pressable> 
          </View>  : null              
         }  
       </>
     )
}



const Words = memo(({word}:{word:string}) => {

  
  const ref = useRef<Text>(null);
  const textRefArray = useContext(TextRefContext);
  
  useEffect(() => {textRefArray.push(ref)},[]);

  return  <Text
            ref = {ref}
            className="text-[40px] text-black   font-bold pl-2 text-left flex"
            style={{opacity:0.5}}
            
          > 
              {word} 
          </Text> 
  
 
})

