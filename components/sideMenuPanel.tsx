import {
  CardTitle,
  ClickableCard,
  IconContainer,
  RowLayout,
  SectionSpacing,
} from "./dev";
import { useRouter } from "expo-router";

export default function SideMenuPannel(props: {
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
          <IconContainer color="neutral">{props.icon}</IconContainer>
          <CardTitle className="ml-4">{props.label}</CardTitle>
        </RowLayout>
      </ClickableCard>
    </SectionSpacing>
  );
}
