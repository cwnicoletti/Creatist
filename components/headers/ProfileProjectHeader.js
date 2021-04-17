import React from "react";
import { View, Image, Text, Platform } from "react-native";
import { useSelector } from "react-redux";
import { HeaderButtons, Item } from "react-navigation-header-buttons";
import HeaderButton from "../UI/IoniconsHeaderButton";
import GoBack from "../headers_components/GoBack";
import Title from "../headers_components/Title";
import Settings from "../headers_components/Settings";

const ProfileHeader = ({ navigation }) => {
  const darkModeValue = useSelector((state) => state.switches.darkMode);

  return (
    <View>
      <View
        style={{
          padding: 20,
          backgroundColor: darkModeValue ? "black" : "white",
        }}
      />
      <View style={{ flexDirection: "row" }}>
        <GoBack
          darkModeValue={darkModeValue}
          navigation={navigation}
          HeaderButton={HeaderButton}
          HeaderButtons={HeaderButtons}
          Item={Item}
          View={View}
          Platform={Platform}
        />
        <Title
          View={View}
          Image={Image}
          Text={Text}
          darkModeValue={darkModeValue}
        />
        <Settings
          darkModeValue={darkModeValue}
          navigation={navigation}
          HeaderButton={HeaderButton}
          HeaderButtons={HeaderButtons}
          Item={Item}
          View={View}
          Platform={Platform}
        />
      </View>
    </View>
  );
};

export default ProfileHeader;
