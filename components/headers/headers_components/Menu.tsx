import React from "react";

const Menu = (props) => {
  return (
    <props.View
      style={{
        flex: 1,
        padding: 10,
        borderBottomWidth: 1,
        borderColor: "gray",
        backgroundColor: props.darkModeValue ? "black" : "white",
      }}
    >
      <props.HeaderButtons HeaderButtonComponent={props.HeaderButton}>
        <props.Item
          title="Menu"
          iconName={props.Platform.OS === "android" ? "md-menu" : "ios-menu"}
          color={props.darkModeValue ? "white" : "black"}
          onPress={() => {
            props.navigation.toggleLeftDrawer();
          }}
        />
      </props.HeaderButtons>
    </props.View>
  );
};

export default Menu;
