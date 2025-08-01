import { onBackPress } from "@/utils/navigation";
import { AntDesign } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";

export default function BackArrow() {
   return (
    
       <TouchableOpacity
         onPress={onBackPress}
         className="absolute left-4"
         style={{ zIndex: 10 }}
       >
         <AntDesign name="arrowleft" size={28} color="#333333ff" />
       </TouchableOpacity>
   
   );
}