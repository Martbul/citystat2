import React from "react";
import { View, Text, ViewProps, TextProps } from "react-native";
import { cn } from "@/utils/cn";

// Base Card component
export function Card({ className, ...props }: ViewProps & { className?: string }) {
  return (
    <View
      className={cn(
        "bg-white flex flex-col rounded-xl border border-gray-200 shadow-sm p-6",
        className
      )}
      {...props}
    />
  );
}

// Card Header component
export function CardHeader({ className, ...props }: ViewProps & { className?: string }) {
  return (
    <View
      className={cn(
        "flex flex-col gap-1.5 mb-4",
        className
      )}
      {...props}
    />
  );
}

// Card Title component
export function CardTitle({ 
  className, 
  children,
  ...props 
}: ViewProps & { 
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <View className={cn("", className)} {...props}>
      <Text className="text-lg font-semibold text-gray-900 leading-tight">
        {children}
      </Text>
    </View>
  );
}

// Card Description component
export function CardDescription({ 
  className, 
  children,
  ...props 
}: ViewProps & { 
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <View className={cn("", className)} {...props}>
      <Text className="text-sm text-gray-600">
        {children}
      </Text>
    </View>
  );
}

// Card Action component (for buttons, icons in header)
export function CardAction({ className, ...props }: ViewProps & { className?: string }) {
  return (
    <View
      className={cn(
        "absolute top-6 right-6",
        className
      )}
      {...props}
    />
  );
}

// Card Content component
export function CardContent({ className, ...props }: ViewProps & { className?: string }) {
  return (
    <View
      className={cn(
        "flex-1",
        className
      )}
      {...props}
    />
  );
}

// Card Footer component
export function CardFooter({ className, ...props }: ViewProps & { className?: string }) {
  return (
    <View
      className={cn(
        "flex flex-row items-center mt-4 pt-4 border-t border-gray-200",
        className
      )}
      {...props}
    />
  );
}

// Alternative version with more flexible styling
export function FlexibleCard({ className, ...props }: ViewProps & { className?: string }) {
  return (
    <View
      className={cn(
        "bg-white rounded-xl border border-gray-200 shadow-sm",
        className
      )}
      {...props}
    />
  );
}

export function FlexibleCardHeader({ 
  className, 
  withBorder = false,
  ...props 
}: ViewProps & { 
  className?: string;
  withBorder?: boolean;
}) {
  return (
    <View
      className={cn(
        "px-6 pt-6",
        withBorder && "pb-4 border-b border-gray-200",
        !withBorder && "pb-2",
        className
      )}
      {...props}
    />
  );
}

export function FlexibleCardContent({ className, ...props }: ViewProps & { className?: string }) {
  return (
    <View
      className={cn(
        "px-6 py-4",
        className
      )}
      {...props}
    />
  );
}

export function FlexibleCardFooter({ 
  className, 
  withBorder = false,
  ...props 
}: ViewProps & { 
  className?: string;
  withBorder?: boolean;
}) {
  return (
    <View
      className={cn(
        "px-6 pb-6",
        withBorder && "pt-4 border-t border-gray-200",
        !withBorder && "pt-2",
        className
      )}
      {...props}
    />
  );
}

// Example usage component
export const CardExample = () => {
  return (
    <View className="p-4">
      {/* Basic Card */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>This is a card description</CardDescription>
        </CardHeader>
        <CardContent>
          <Text className="text-gray-700">
            This is the main content of the card. You can put any React Native components here.
          </Text>
        </CardContent>
        <CardFooter>
          <Text className="text-sm text-gray-500">Footer content</Text>
        </CardFooter>
      </Card>

      {/* Card with Action */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Card with Action</CardTitle>
          <CardDescription>This card has an action button</CardDescription>
          <CardAction>
            <View className="w-6 h-6 bg-blue-500 rounded-full" />
          </CardAction>
        </CardHeader>
        <CardContent>
          <Text className="text-gray-700">Content goes here</Text>
        </CardContent>
      </Card>

      {/* Flexible Card with borders */}
      <FlexibleCard>
        <FlexibleCardHeader withBorder>
          <CardTitle>Flexible Card</CardTitle>
          <CardDescription>With customizable borders</CardDescription>
        </FlexibleCardHeader>
        <FlexibleCardContent>
          <Text className="text-gray-700">Flexible content area</Text>
        </FlexibleCardContent>
        <FlexibleCardFooter withBorder>
          <Text className="text-sm text-gray-500">Flexible footer</Text>
        </FlexibleCardFooter>
      </FlexibleCard>
    </View>
  );
};