import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TouchableNativeFeedback,
  Platform,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import TutorialModalNoBackground from "../UI/modals/TutorialModalNoBackground";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { withNavigation } from "react-navigation";
import { setTutorialing, setTutorialPrompt } from "../../store/actions/user";

const TutorialExhibitCreation = (props) => {
  const dispatch = useAppDispatch();

  const ExhibitUId = props.ExhibitUId;
  const localId = props.localId;

  let android = null;
  let TouchableCmp = TouchableOpacity;
  if (Platform.OS === "android") {
    TouchableCmp = TouchableNativeFeedback;
    android = true;
  }

  const nextTutorialHandler = async () => {
    dispatch(setTutorialing(localId, ExhibitUId, true, "ExhibitView"));
    props.navigation.goBack();
  };

  return (
    <TutorialModalNoBackground
      localId={localId}
      ExhibitUId={ExhibitUId}
      screen="AddProject"
      title={"Creating an Exhibit"}
    >
      <View style={{ margin: 10 }}>
        <Text
          style={{
            color: "white",
            fontSize: 16,
            margin: 5,
            alignSelf: "center",
          }}
        >
          Here you'll add a cover picture, a title, and a description for your
          exhibit
        </Text>
      </View>
      <View style={{ margin: 10 }}>
        <Text
          style={{
            color: "white",
            fontSize: 16,
            margin: 5,
            alignSelf: "center",
          }}
        >
          You can also add multiple links to your exhibit
        </Text>
      </View>
      <View style={{ margin: 10 }}>
        <Text
          style={{
            color: "white",
            fontSize: 16,
            margin: 5,
            alignSelf: "center",
          }}
        >
          Above you can also see a preview of your exhibit
        </Text>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignSelf: "center",
          margin: 10,
        }}
      >
        <TouchableCmp
          style={{
            flex: 1,
            borderColor: "#007AFF",
            borderWidth: 1,
            margin: 5,
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
          }}
          onPress={nextTutorialHandler}
        >
          <Text
            style={{
              margin: 5,
              color: "#007AFF",
              fontSize: 14,
            }}
          >
            Next
          </Text>
          <Feather
            name="arrow-right"
            size={16}
            color={"#007AFF"}
            style={{ alignSelf: "center" }}
          />
        </TouchableCmp>
      </View>
    </TutorialModalNoBackground>
  );
};

export default withNavigation(TutorialExhibitCreation);
