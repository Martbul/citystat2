import React from "react";
import { ScrollView } from "react-native";
import { Ionicons, AntDesign, Feather, FontAwesome } from "@expo/vector-icons";
import { BodyText, Card, CardTitle, CenteredColumn, ClickableCard, GradientHeader, HeaderButton, IconContainer, LargeSpacing, MutedText, PageContainer, PageTitle, RowLayout, SecondaryText, SectionSpacing, SectionTitle, SpaceBetweenRow } from "@/components/dev";


const DevScreen = () => {
  return (
    <PageContainer>
      {/* Header */}
      <GradientHeader>
        <HeaderButton onPress={() => console.log("Notifications")}>
          <Ionicons name="notifications" size={24} color="#1F2937" />
        </HeaderButton>
        <HeaderButton onPress={() => console.log("Settings")}>
          <Ionicons name="settings" size={24} color="#1F2937" />
        </HeaderButton>
      </GradientHeader>

      <ScrollView className="px-4 pt-6">
        {/* Titles */}
        <SectionSpacing>
          <PageTitle>Developer Screen</PageTitle>
          <SecondaryText>Quick style guide showcase</SecondaryText>
        </SectionSpacing>

        {/* Card Example */}
        <SectionSpacing>
          <Card>
            <SectionTitle>Basic Card</SectionTitle>
            <RowLayout>
              <IconContainer size="large" color="neutral">
                <Ionicons name="person-circle" size={28} color="#6B7280" />
              </IconContainer>
              <BodyText className="ml-4">This is card content</BodyText>
            </RowLayout>
          </Card>
        </SectionSpacing>

        {/* ClickableCard Example */}
        <SectionSpacing>
          <ClickableCard onPress={() => console.log("Clicked users card")}>
            <RowLayout>
              <IconContainer color="green">
                <Ionicons name="people" size={20} color="#10B981" />
              </IconContainer>
              <CardTitle className="ml-4">Users</CardTitle>
            </RowLayout>
          </ClickableCard>
        </SectionSpacing>

        {/* Row Layout Example */}
        <SectionSpacing>
          <SectionTitle>Row Layout Example</SectionTitle>
          <RowLayout>
            <IconContainer size="small" color="blue">
              <Feather name="hash" size={16} color="#3B82F6" />
            </IconContainer>
            <BodyText className="ml-3">#hashtag</BodyText>
          </RowLayout>
        </SectionSpacing>

        {/* Space Between Layout */}
        <SectionSpacing>
          <SectionTitle>Space Between Layout</SectionTitle>
          <SpaceBetweenRow>
            <BodyText>Left Content</BodyText>
            <MutedText>Right Content</MutedText>
          </SpaceBetweenRow>
        </SectionSpacing>

        {/* Centered Column */}
        <LargeSpacing>
          <SectionTitle>Centered Column</SectionTitle>
          <CenteredColumn>
            <IconContainer size="large" color="accent">
              <FontAwesome name="star" size={22} color="white" />
            </IconContainer>
            <MutedText>Centered Text Below Icon</MutedText>
          </CenteredColumn>
        </LargeSpacing>
      </ScrollView>
    </PageContainer>
  );
};

export default DevScreen;
