import { Ionicons } from "@expo/vector-icons";
import {
  CardTitle,
  ClickableCard,
  IconContainer,
  RowLayout,
  SectionSpacing,
} from "./dev";
import { useRouter } from "expo-router";

export default function SettingsPannel(props: {
  route?: any;
  pressFunc?: () => void;
  label: string;
  icon?: React.ReactNode;
  seconLabel?: string;
  border?: boolean;
  borderColor?: string;
  openPopup?: any;
  labelStyle?: string;
}) {
  const router = useRouter();

  const borderClasses = props.border
    ? `border ${props.borderColor ?? "border-gray-300"}`
    : "";

  const handlePress = () => {
    if (props.pressFunc) {
      props.pressFunc();
    } else if (props.route) {
      router.push(props.route);
    }
  };

  return (
    <SectionSpacing className="mb-3">
      <ClickableCard onPress={handlePress}>
        <RowLayout>
          <IconContainer color="accent">{props.icon}</IconContainer>
          <CardTitle className="ml-4">{props.label}</CardTitle>
        </RowLayout>
      </ClickableCard>
    </SectionSpacing>
  );
}
