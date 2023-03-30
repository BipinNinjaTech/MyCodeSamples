import { useEffect, useRef, useState } from "react";
import { TextField, LoadingButton } from "../../UITools";
import { Checkbox, Stack } from "@mui/material";
import {
  FormlabelWrap,
  FormlabelText,
} from "Components/UITools/TextField/TextField.style";
import { Camera } from "phosphor-react";
import Image from "next/image";
import { ImageWrap } from "../Spaces.style";
import { COLORS } from "styles/colors";
import useSpace from "Services/ActionHooks/Space/useSpace";
import useFetchRequest from "Services/hooks/useGetRequest";
import { SpacePublicView } from "Services/ActionHooks/Space/types";
import useRouter from "hooks/useRouter";
import { CheckBoxWrapper } from "Components/Circles/Chat/Chat.style";
import { BodyMedium1Primary1, CaptionRegularNeutral3 } from "styles/text.style";

interface Image {
  file?: File;
  url: string;
}

interface Error {
  [key: string]: boolean;
}

interface SpaceValues {
  name: string;
  description: string;
}

interface P {
  id?: number;
}

const CreateSpace = ({ id }: P) => {
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const { navigate } = useRouter();
  const [checked, setChecked] = useState(false);
  const { createSpace, editSpace } = useSpace();
  const [image, setImage] = useState<Image | undefined>();
  const [values, setValues] = useState<SpaceValues>({
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState<Error>({});
  const [saveLoading, setSaveLoading] = useState(false);

  const { data: spacePublicView } = useFetchRequest<SpacePublicView>(
    `space/${id}/view`,
    []
  );

  useEffect(() => {
    if (!spacePublicView || !id) return;
    setValues({
      name: spacePublicView.name,
      description: spacePublicView.description,
    });
    setChecked(spacePublicView?.isPublic);
    setImage({
      url: spacePublicView.bannerImageUri,
    });
  }, [spacePublicView]);

  const handleUploadClick = () => {
    uploadInputRef.current && uploadInputRef.current.click();
  };

  const handleChange = (files: FileList) => {
    setImage({
      file: files[0],
      url: URL.createObjectURL(files[0]),
    });
  };

  const handleChangeField = (value: string, name: keyof SpaceValues) => {
    if (name === "description" && value.length > 250) return;
    setValues((prevState) => {
      return {
        ...prevState,
        [name]: value,
      };
    });
    setErrors((prevState) => {
      return {
        ...prevState,
        [name]: false,
      };
    });
  };

  const handleSubmit = async () => {
    setErrors((prevState) => {
      return {
        ...prevState,

        name: !values?.name,
        description: !values?.description,
      };
    });
    if (!values?.name || !values?.description) return;

    setSaveLoading(true);
    const payload = Object.assign(
      {
        ...values,
        isPublic: checked ? "true" : "",
        isRemove: !image?.file && !image?.url ? "true" : "false",
      },
      image?.file && {
        bannerImage: image.file,
      }
    );

    let response;
    if (id) {
      response = await editSpace({
        ...payload,
        spaceId: id.toString(),
      });
    } else {
      response = await createSpace(payload);
    }
    if (response) {
      navigate(
        `/spaces/${id ? id : response}`,
        id ? id : parseInt(response.toString())
      );
    }
    setSaveLoading(false);
  };

  return (
    <Stack spacing={2} p={2}>
      <TextField
        formLabel="Space Name"
        placeholder="Space Name"
        fullWidth
        onChange={(e) => handleChangeField(e.target.value, "name")}
        error={errors?.["name"]}
        value={values.name}
      />
      <TextField
        formLabel="Description"
        placeholder="Tell us about circle"
        multiline
        rows={2}
        fullWidth
        infoTextLeft={"Max. 250 words"}
        infoText={`${values.description.length} words`}
        onChange={(e) => handleChangeField(e.target.value, "description")}
        error={errors?.["description"]}
        value={values.description}
      />
      <Stack direction="row" alignItems="center" mt={4}>
        <CheckBoxWrapper>
          <Checkbox
            onChange={() => setChecked(!checked)}
            checked={checked}
            defaultChecked
            size="small"
          />
        </CheckBoxWrapper>

        <BodyMedium1Primary1>Make this a Public Space</BodyMedium1Primary1>
      </Stack>
      <CaptionRegularNeutral3>
        Anyone in VibeWith community will be able to find and request to join a
        public space. Whereas to find and request to join a private space, a
        user will need an invitation link.
      </CaptionRegularNeutral3>
      <Stack>
        <FormlabelWrap>
          <FormlabelText>Space Image</FormlabelText>
        </FormlabelWrap>
        <ImageWrap onClick={handleUploadClick}>
          <input
            ref={uploadInputRef}
            type="file"
            accept="image/png, image/jpeg, image/jpg"
            style={{ display: "none" }}
            onChange={(e) => {
              e.target.files && handleChange(e.target.files);
              e.target.value = "";
            }}
          />
          {image?.url ? (
            <Image
              src={image?.url}
              alt={`image`}
              objectFit="cover"
              layout="fill"
            />
          ) : (
            <Camera size={32} color={COLORS.neutral_7} />
          )}
        </ImageWrap>
      </Stack>
      <LoadingButton
        variant="contained"
        fullWidth
        size="large"
        loading={saveLoading}
        onClick={handleSubmit}
      >
        {id ? "Save" : "Create"}
      </LoadingButton>
    </Stack>
  );
};

export default CreateSpace;
