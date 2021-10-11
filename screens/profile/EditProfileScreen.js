import { Ionicons, Octicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useCallback, useEffect, useReducer, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableNativeFeedback,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { HeaderButtons, Item } from "react-navigation-header-buttons";
import MainHeaderTitle from "../../components/UI/MainHeaderTitle";
import correctUrls from "../../helper/correctUrls";
import parseLinkValuesFromInputValues from "../../helper/parseLinkValuesFromInputValues";
import linkFormReducer from "../../helper/linkFormReducer";
import updateArrayOnRemove from "../../helper/updateArrayOnRemove";
import getPhotoPermissions from "../../helper/getPhotoPermissions";
import { useAppDispatch, useAppSelector } from "../../hooks";
import TutorialEditProfile from "../../components/tutorial/TutorialEditProfile";
import Input from "../../components/UI/Input";
import IoniconsHeaderButton from "../../components/UI/header_buttons/IoniconsHeaderButton";
import ImageResizer from "react-native-image-resizer";
import {
  uploadChangeProfilePicture,
  uploadUpdateUserProfile,
} from "../../store/actions/user/user";
import LinksList from "../../components/UI/LinksList";

const FORM_INPUT_UPDATE = "FORM_INPUT_UPDATE";
const FORM_INPUT_LINKS_UPDATE = "FORM_INPUT_LINKS_UPDATE";
const FORM_INPUT_LINKS_REMOVE = "FORM_INPUT_LINKS_REMOVE";

const EditProfileScreen = (props) => {
  const dispatch = useAppDispatch();
  const [fileSizeError, setFileSizeError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const prevLinks = useAppSelector((state) => state.user.profileLinks);
  const [linksState, setLinksState] = useState(Object.values(prevLinks));
  const [isLoadingTempPicture, setIsLoadingTempPicture] = useState(false);
  const darkModeValue = useAppSelector((state) => state.user.darkMode);
  const localId = useAppSelector((state) => state.auth.userId);
  const ExhibitUId = useAppSelector((state) => state.user.ExhibitUId);
  const profilePictureId = useAppSelector(
    (state) => state.user.profilePictureId
  );
  const profilePictureBase64 = useAppSelector(
    (state) => state.user.profilePictureBase64
  );
  const followingValue = useAppSelector((state) => state.user.hideFollowing);
  const followersValue = useAppSelector((state) => state.user.hideFollowers);
  const exhibitsValue = useAppSelector((state) => state.user.hideExhibits);
  const tutorialing = useAppSelector((state) => state.user.tutorialing);
  const tutorialScreen = useAppSelector((state) => state.user.tutorialScreen);
  const profileExhibits = useAppSelector((state) => state.user.profileExhibits);

  let userData = {
    fullname: useAppSelector((state) => state.user.fullname),
    username: useAppSelector((state) => state.user.username),
    jobTitle: useAppSelector((state) => state.user.jobTitle),
    profileBiography: useAppSelector((state) => state.user.profileBiography),
  };

  const userDataProfileHeader = {
    numberOfFollowers: useAppSelector((state) => state.user.numberOfFollowers),
    numberOfFollowing: useAppSelector((state) => state.user.numberOfFollowing),
    numberOfAdvocates: useAppSelector((state) => state.user.numberOfAdvocates),
  };

  let TouchableCmp = TouchableOpacity;
  if (Platform.OS === "android") {
    TouchableCmp = TouchableNativeFeedback;
  }

  let initialState = {
    inputValues: {
      fullname: userData.fullname ? userData.fullname : "",
      jobTitle: userData.jobTitle ? userData.jobTitle : "",
      username: userData.username ? userData.username : "",
      bio: userData.profileBiography ? userData.profileBiography : "",
      ...prevLinks,
    },
    inputValidities: {
      fullname: userData.fullname ? true : false,
      jobTitle: userData.jobTitle ? true : false,
      username: userData.username ? true : false,
      bio: userData.profileBiography ? true : false,
    },
    formIsValid: userData ? true : false,
  };

  const [formState, dispatchFormState] = useReducer(
    linkFormReducer,
    initialState
  );

  const inputChangeHandler = useCallback(
    (inputIdentifier, inputValue, inputValidity) => {
      if (inputIdentifier.search("linkTitle") !== -1) {
        const linkNumber = inputIdentifier.replace("linkTitle", "");
        dispatchFormState({
          type: FORM_INPUT_LINKS_UPDATE,
          value: inputValue,
          isValid: inputValidity,
          input: inputIdentifier,
          linkNum: linkNumber,
        });
      } else if (inputIdentifier.search("linkUrl") !== -1) {
        const linkNumber = inputIdentifier.replace("linkUrl", "");
        dispatchFormState({
          type: FORM_INPUT_LINKS_UPDATE,
          value: inputValue,
          isValid: inputValidity,
          input: inputIdentifier,
          linkNum: linkNumber,
        });
      } else {
        dispatchFormState({
          type: FORM_INPUT_UPDATE,
          value: inputValue,
          isValid: inputValidity,
          input: inputIdentifier,
        });
      }
    },
    [dispatchFormState]
  );

  const submitHandler = useCallback(async () => {
    const links = await parseLinkValuesFromInputValues(formState);
    const newLinks = correctUrls(links);
    await setIsLoading(true);
    await dispatch(
      uploadUpdateUserProfile(
        ExhibitUId,
        localId,
        formState.inputValues.fullname,
        formState.inputValues.jobTitle,
        formState.inputValues.username,
        formState.inputValues.bio,
        newLinks
      )
    );
    userData = {
      fullname: formState.inputValues.fullname,
      username: formState.inputValues.jobTitle,
      jobTitle: formState.inputValues.username,
      profileBiography: formState.inputValues.bio,
    };
    await setIsLoading(false);
    props.navigation.navigate("Profile");
  }, [dispatch, formState]);

  const changeProfilePicture = async () => {
    if (!(await getPhotoPermissions())) {
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "Images",
      allowsEditing: true,
      base64: true,
      quality: 1,
    });

    await setIsLoadingTempPicture(true);
    if (!result.cancelled) {
      const fileSize = result.base64.length * (3 / 4) - 2;
      if (fileSize > 6000000) {
        setFileSizeError(true);
      } else {
        setFileSizeError(false);
        const base64 = `data:image/png;base64,${result.base64}`;
        await dispatch(
          uploadChangeProfilePicture(
            base64,
            ExhibitUId,
            localId,
            profilePictureId
          )
        );
      }
    }
    await setIsLoadingTempPicture(false);
  };

  const addLink = async () => {
    await setLinksState((prevState) =>
      prevState.concat({
        linkId: prevState.length + 1,
        linkTitle: "",
        linkUrl: "",
      })
    );
  };

  const removeLink = async (linkNumber) => {
    const index = linkNumber - 1;
    await setLinksState((prevState) => prevState.filter((_, i) => i !== index));
    await setLinksState((prevState) => updateArrayOnRemove(prevState));
    dispatchFormState({
      type: FORM_INPUT_LINKS_REMOVE,
      linkNum: linkNumber,
    });
  };

  useEffect(() => {
    props.navigation.setParams({ submit: submitHandler });
  }, []);

  useEffect(() => {
    props.navigation.setParams({ darkMode: darkModeValue });
  }, [darkModeValue]);

  return (
    <KeyboardAwareScrollView
      enabledOnAndroid={true}
      extraScrollHeight={100}
      keyboardShouldPersistTaps="handled"
      style={{ backgroundColor: darkModeValue ? "black" : "white" }}
      scrollEnabled={true}
    >
      {tutorialing &&
      (tutorialScreen === "EditProfile" ||
        tutorialScreen === "CreateExhibit") ? (
        <TutorialEditProfile ExhibitUId={ExhibitUId} localId={localId} />
      ) : null}
      <Text
        style={{
          fontSize: 28,
          fontWeight: "bold",
          textAlign: "center",
          margin: 10,
          color: darkModeValue ? "white" : "black",
        }}
      >
        Preview
      </Text>
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          margin: 5,
          borderWidth: 1,
          borderColor: "gray",
        }}
      >
        <SafeAreaView forceInset={{ top: "always", horizontal: "never" }}>
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              style={{
                height: 100,
                width: 100,
                borderRadius: 100 / 2,
                marginTop: 20,
              }}
              source={
                profilePictureBase64
                  ? { uri: profilePictureBase64 }
                  : require("../../assets/default-profile-icon.jpg")
              }
            />
            <Text
              style={{
                color: darkModeValue ? "white" : "black",
                fontSize: 24,
                fontWeight: "bold",
                paddingTop: 5,
              }}
            >
              {formState.inputValues.fullname}
            </Text>
            {formState.inputValues.jobTitle ? (
              <Text
                style={{
                  color: darkModeValue ? "white" : "black",
                  fontSize: 17,
                  fontWeight: "bold",
                  paddingTop: 5,
                }}
              >
                {formState.inputValues.jobTitle}
              </Text>
            ) : null}
            <Text
              style={{
                color: darkModeValue ? "white" : "black",
                fontSize: 16,
                margin: 5,
              }}
            >
              @{formState.inputValues.username}
            </Text>
          </View>
        </SafeAreaView>
        <View
          style={{
            margin: 10,
            flexDirection: "row",
          }}
        >
          {!followersValue ? (
            <TouchableCmp
              style={{
                flex: 1,
                borderColor: darkModeValue ? "gray" : "#c9c9c9",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  flex: 1,
                  borderColor: darkModeValue ? "gray" : "#c9c9c9",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    margin: 5,
                    color: darkModeValue ? "white" : "black",
                    fontWeight: "bold",
                  }}
                >
                  Followers
                </Text>
                <Text
                  style={{
                    marginBottom: 5,
                    color: darkModeValue ? "white" : "black",
                  }}
                >
                  {userDataProfileHeader.numberOfFollowers}
                </Text>
              </View>
            </TouchableCmp>
          ) : null}
          {!followingValue ? (
            <TouchableCmp
              style={{
                flex: 1,
                borderColor: darkModeValue ? "gray" : "#c9c9c9",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  flex: 1,
                  borderColor: darkModeValue ? "gray" : "#c9c9c9",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    margin: 5,
                    color: darkModeValue ? "white" : "black",
                    fontWeight: "bold",
                  }}
                >
                  Following
                </Text>
                <Text
                  style={{
                    marginBottom: 5,
                    color: darkModeValue ? "white" : "black",
                    fontSize: 15,
                  }}
                >
                  {userDataProfileHeader.numberOfFollowing}
                </Text>
              </View>
            </TouchableCmp>
          ) : null}
          {!exhibitsValue ? (
            <TouchableCmp
              style={{
                flex: 1,
                borderColor: darkModeValue ? "gray" : "#c9c9c9",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  flex: 1,
                  borderColor: darkModeValue ? "gray" : "#c9c9c9",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    margin: 5,
                    color: darkModeValue ? "white" : "black",
                    fontWeight: "bold",
                  }}
                >
                  Exhibits
                </Text>
                <Text
                  style={{
                    marginBottom: 5,
                    color: darkModeValue ? "white" : "black",
                    fontSize: 15,
                  }}
                >
                  {Object.keys(profileExhibits).length}
                </Text>
              </View>
            </TouchableCmp>
          ) : null}
        </View>
        {formState.inputValues.bio ? (
          <Text
            style={{ color: darkModeValue ? "white" : "black", padding: 20 }}
          >
            {formState.inputValues.bio}
          </Text>
        ) : null}
        {Object.keys(parseLinkValuesFromInputValues(formState)).length <= 1 ? (
          <LinksList
            links={Object.values(parseLinkValuesFromInputValues(formState))}
          />
        ) : (
          <LinksList
            links={Object.values(parseLinkValuesFromInputValues(formState))}
          />
        )}
      </View>
      {!isLoadingTempPicture ? (
        <TouchableCmp
          style={{
            margin: 10,
            alignSelf: "center",
          }}
          onPress={changeProfilePicture}
        >
          <View
            style={{
              alignItems: "center",
              flexDirection: "row",
            }}
          >
            <Octicons name="pencil" size={14} color="#007AFF" />
            <Text style={{ margin: 10, color: "#007AFF" }}>
              Change Profile Picture
            </Text>
          </View>
        </TouchableCmp>
      ) : (
        <View
          style={{
            margin: 20,
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
          }}
        >
          <Text
            style={{
              fontWeight: "bold",
              textAlign: "center",
              color: darkModeValue ? "white" : "black",
              margin: 10,
            }}
          >
            Changing profile picture...
          </Text>
          <ActivityIndicator size="small" color="white" />
        </View>
      )}
      {fileSizeError ? (
        <Text
          style={{
            color: "red",
            alignSelf: "center",
            marginHorizontal: 10,
            marginTop: 5,
            marginBottom: 15,
          }}
        >
          Picture file size bigger than 6MB. Try cropping or using a different
          picture.
        </Text>
      ) : null}
      <Input
        textLabel={{ color: darkModeValue ? "white" : "black" }}
        id="fullname"
        label="Name"
        errorText="Please enter a valid name!"
        keyboardType="default"
        autoCapitalize="sentences"
        returnKeyType="next"
        onInputChange={inputChangeHandler}
        initialValue={userData.fullname ? userData.fullname : ""}
        initiallyValid={userData.fullname}
        required
        styleInput={{
          marginBottom: 10,
        }}
      />
      <Input
        textLabel={{ color: darkModeValue ? "white" : "black" }}
        id="username"
        label="Username"
        errorText="Please enter a valid username!"
        keyboardType="default"
        returnKeyType="next"
        onInputChange={inputChangeHandler}
        initialValue={userData.username ? userData.username : ""}
        initiallyValid={userData.username}
        required
        styleInput={{
          marginBottom: 10,
        }}
      />
      <Input
        textLabel={{ color: darkModeValue ? "white" : "black" }}
        id="jobTitle"
        label="Profile Title"
        keyboardType="default"
        returnKeyType="next"
        onInputChange={inputChangeHandler}
        initialValue={userData.jobTitle ? userData.jobTitle : ""}
        initiallyValid={userData.jobTitle}
        styleInput={{
          marginBottom: 10,
        }}
      />
      <Input
        textLabel={{ color: darkModeValue ? "white" : "black" }}
        id="bio"
        label="Bio"
        errorText="Please enter a valid bio!"
        keyboardType="default"
        multiline
        styleInput={{ height: 80 }}
        onInputChange={inputChangeHandler}
        initialValue={
          userData.profileBiography ? userData.profileBiography : ""
        }
        initiallyValid={userData.profileBiography}
        styleInput={{
          height: 60,
          marginBottom: 10,
        }}
      />
      {linksState.map((link, i) => (
        <View key={link.linkId}>
          <View
            style={{
              borderTopWidth: 1,
              width: "80%",
              alignSelf: "center",
              margin: 10,
              borderColor: darkModeValue ? "white" : "black",
            }}
          />
          <Text
            style={{
              color: darkModeValue ? "white" : "black",
              textAlign: "center",
              margin: 10,
            }}
          >
            Link {i + 1}
          </Text>
          <Input
            textLabel={{ color: darkModeValue ? "white" : "black" }}
            id={`linkTitle${link.linkId}`}
            label={`Link ${link.linkId} Title`}
            onSubmitEditing={() => {
              this[`linkUrl${link.linkId}`].focus();
            }}
            errorText="Please enter a valid title!"
            keyboardType="default"
            onInputChange={inputChangeHandler}
            initialValue={link[`linkTitle${link.linkId}`]}
            initiallyValid={true}
            required
          />
          <Input
            textLabel={{ color: darkModeValue ? "white" : "black" }}
            id={`linkUrl${link.linkId}`}
            label={`Link ${link.linkId} Url`}
            inputRef={(ref) => (this[`linkUrl${link.linkId}`] = ref)}
            errorText="Please enter a valid link url!"
            keyboardType={Platform.OS === "ios" ? "url" : "default"}
            onInputChange={inputChangeHandler}
            autoCorrect={false}
            initialValue={link[`linkUrl${link.linkId}`]}
            initiallyValid={true}
            required
          />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            <TouchableCmp
              style={{
                margin: 10,
                flexDirection: "row",
                alignItems: "center",
              }}
              onPress={async () => {
                await removeLink(i + 1);
              }}
            >
              <Ionicons name="ios-remove" size={14} color="red" />
              <Text style={{ margin: 10, color: "red" }}>
                Remove link {i + 1}
              </Text>
            </TouchableCmp>
          </View>
        </View>
      ))}
      {linksState && Object.keys(linksState).length <= 0 ? (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <TouchableCmp
            style={{
              margin: 10,
              flexDirection: "row",
              alignItems: "center",
            }}
            onPress={async () => {
              await addLink();
            }}
          >
            <Ionicons name="ios-add" size={14} color="green" />
            <Text style={{ margin: 10, color: "green" }}>
              Add a link to profile
            </Text>
          </TouchableCmp>
        </View>
      ) : null}
      {linksState && Object.keys(linksState).length > 0 ? (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <TouchableCmp
            style={{
              margin: 10,
              flexDirection: "row",
              alignItems: "center",
            }}
            onPress={async () => {
              await addLink();
            }}
          >
            <Ionicons name="ios-add" size={14} color="green" />
            <Text style={{ margin: 10, color: "green" }}>Add another link</Text>
          </TouchableCmp>
        </View>
      ) : null}
      {!isLoading ? (
        <TouchableCmp
          style={{
            margin: 20,
            alignSelf: "center",
            alignItems: "center",
            flexDirection: "row",
          }}
          onPress={submitHandler}
        >
          <Text style={{ margin: 10, color: "#007AFF" }}>
            Confirm profile edits
          </Text>
          <Ionicons name="ios-checkmark" size={18} color="#007AFF" />
        </TouchableCmp>
      ) : (
        <View
          style={{
            margin: 20,
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
          }}
        >
          <Text
            style={{
              fontWeight: "bold",
              textAlign: "center",
              color: darkModeValue ? "white" : "black",
              margin: 10,
            }}
          >
            Uploading profile edits...
          </Text>
          <ActivityIndicator size="small" color="white" />
        </View>
      )}
    </KeyboardAwareScrollView>
  );
};

EditProfileScreen.navigationOptions = (navData) => {
  const darkModeValue = navData.navigation.getParam("darkMode");

  return {
    headerTitle: () => (
      <MainHeaderTitle
        darkModeValue={darkModeValue}
        titleName={"Edit Profile"}
      />
    ),
    headerStyle: {
      backgroundColor: darkModeValue ? "black" : "white",
    },
    headerLeft: () => (
      <HeaderButtons HeaderButtonComponent={IoniconsHeaderButton}>
        <Item
          title="Add"
          iconName={"ios-arrow-back"}
          color={darkModeValue ? "white" : "black"}
          onPress={() => {
            navData.navigation.goBack();
          }}
        />
      </HeaderButtons>
    ),
  };
};

const styles = StyleSheet.create({
  text: {
    padding: 10,
  },
  image: {
    height: 30,
    width: 30,
    marginRight: 5,
  },
});

export default EditProfileScreen;
