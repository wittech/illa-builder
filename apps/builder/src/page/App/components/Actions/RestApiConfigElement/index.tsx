import { FC, useState } from "react"
import { RestApiConfigElementProps } from "./interface"
import { useTranslation } from "react-i18next"
import { Controller, useForm } from "react-hook-form"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@/store"
import {
  Resource,
  RestApiAuth,
  RestApiResource,
} from "@/redux/resource/resourceState"
import {
  applyConfigItemLabelText,
  configItem,
  configItemTip,
  container,
  divider,
  footerStyle,
  labelContainer,
  optionLabelStyle,
} from "./style"
import { getColor } from "@illa-design/theme"
import { Input } from "@illa-design/input"
import { Button, ButtonGroup } from "@illa-design/button"
import { PaginationPreIcon } from "@illa-design/icon"
import { Divider } from "@illa-design/divider"
import { Select } from "@illa-design/select"
import { InputRecordEditor } from "@/page/App/components/InputRecordEditor"
import { BearerAuthPanel } from "@/page/App/components/Actions/RestApiConfigElement/BearerAuthPanel"
import { BasicAuthPanel } from "@/page/App/components/Actions/RestApiConfigElement/BasicAuthPanel"
import { Api } from "@/api/base"
import { Message } from "@illa-design/message"
import { resourceActions } from "@/redux/resource/resourceSlice"

export const RestApiConfigElement: FC<RestApiConfigElementProps> = (props) => {
  const { onBack, onFinished, resourceId } = props

  const { t } = useTranslation()
  const dispatch = useDispatch()

  const { control, handleSubmit, formState } = useForm({
    mode: "onChange",
  })

  const resource = useSelector((state: RootState) => {
    return state.resource.find((r) => r.resourceId === resourceId) as Resource<
      RestApiResource<RestApiAuth>
    >
  })

  const [saving, setSaving] = useState(false)

  const [authType, setAuthType] = useState(
    resource?.content.authentication ?? "none",
  )

  return (
    <form
      onSubmit={handleSubmit((data, event) => {
        let authContent: RestApiAuth | null = null
        switch (data.authType) {
          case "basic":
            authContent = {
              username: data.username,
              password: data.password,
            }
            break
          case "bearer":
            authContent = {
              token: data.token,
            }
            break
          default:
            break
        }
        if (resourceId != undefined) {
          Api.request<Resource<RestApiResource<RestApiAuth>>>(
            {
              method: "PUT",
              url: `/resource/${resourceId}`,
              data: {
                resourceId: data.resourceId,
                resourceName: data.resourceName,
                resourceType: "restapi",
                content: {
                  baseUrl: data.baseUrl,
                  urlParams: data.urlParams,
                  headers: data.headers,
                  cookies: data.cookies,
                  authentication: data.authentication,
                  authContent,
                },
              },
            },
            (response) => {
              onFinished(response.data.resourceId)
              dispatch(resourceActions.updateResourceItemReducer(response.data))
              Message.success(t("dashboard.resource.save_success"))
            },
            () => {
              Message.error(t("dashboard.resource.save_fail"))
            },
            () => {
              Message.error(t("dashboard.resource.save_fail"))
            },
            (loading) => {
              setSaving(loading)
            },
          )
        } else {
          Api.request<Resource<RestApiResource<RestApiAuth>>>(
            {
              method: "POST",
              url: `/resource`,
              data: {
                resourceName: data.resourceName,
                resourceType: "restapi",
                content: {
                  baseUrl: data.baseUrl,
                  urlParams: data.urlParams,
                  headers: data.headers,
                  cookies: data.cookies,
                  authentication: data.authentication,
                  authContent,
                },
              },
            },
            (response) => {
              onFinished(response.data.resourceId)
              dispatch(resourceActions.addResourceItemReducer(response.data))
              Message.success(t("dashboard.resource.save_success"))
            },
            () => {
              Message.error(t("dashboard.resource.save_fail"))
            },
            () => {
              Message.error(t("dashboard.resource.save_fail"))
            },
            (loading) => {
              setSaving(loading)
            },
          )
        }
      })}
    >
      <div css={container}>
        <div css={divider} />
        <div css={configItem}>
          <div css={labelContainer}>
            <span css={applyConfigItemLabelText(getColor("red", "02"))}>*</span>
            <span
              css={applyConfigItemLabelText(getColor("grayBlue", "02"), true)}
            >
              {t("editor.action.resource.restapi.label.name")}
            </span>
          </div>
          <Controller
            control={control}
            defaultValue={resource?.resourceName ?? ""}
            rules={{
              required: true,
            }}
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                w="100%"
                ml="16px"
                mr="24px"
                onBlur={onBlur}
                onChange={onChange}
                value={value}
                borderColor="techPurple"
                placeholder={t(
                  "editor.action.resource.restapi.placeholder.name",
                )}
              />
            )}
            name="resourceName"
          />
        </div>
        <span css={configItemTip}>
          {t("editor.action.resource.restapi.tip.name")}
        </span>
        <Divider
          direction="horizontal"
          ml="24px"
          mr="24px"
          mt="16px"
          mb="8px"
          w="unset"
        />
        <div css={optionLabelStyle}>
          {t("editor.action.resource.restapi.title.advanced_option")}
        </div>
        <div css={configItem}>
          <div css={labelContainer}>
            <span css={applyConfigItemLabelText(getColor("red", "02"))}>*</span>
            <span
              css={applyConfigItemLabelText(getColor("grayBlue", "02"), true)}
            >
              {t("editor.action.resource.restapi.label.base_url")}
            </span>
          </div>
          <Controller
            control={control}
            defaultValue={resource?.content.baseUrl ?? ""}
            rules={{
              required: true,
            }}
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                w="100%"
                ml="16px"
                mr="24px"
                onBlur={onBlur}
                onChange={onChange}
                value={value}
                borderColor="techPurple"
                placeholder={t(
                  "editor.action.resource.restapi.placeholder.base_url",
                )}
              />
            )}
            name="baseUrl"
          />
        </div>
        <Controller
          control={control}
          defaultValue={
            resource?.content.urlParams ?? [
              {
                key: "",
                value: "",
              },
            ]
          }
          render={({ field: { value, onChange, onBlur } }) => (
            <InputRecordEditor
              label={t("editor.action.resource.restapi.label.url_parameters")}
              records={value}
              onAdd={() => {
                onChange([...value, { key: "", value: "" }])
              }}
              onDelete={(index, record) => {
                let newRecords = [...value]
                newRecords.splice(index, 1)
                if (newRecords.length === 0) {
                  newRecords = [{ key: "", value: "" }]
                }
                onChange(newRecords)
              }}
              onChangeKey={(index, key, v) => {
                let newRecords = [...value]
                newRecords[index] = { key, value: v }
                onChange(newRecords)
              }}
              onChangeValue={(index, key, v) => {
                let newRecords = [...value]
                newRecords[index].value = v
                onChange(newRecords)
              }}
            />
          )}
          name="urlParams"
        />
        <Controller
          control={control}
          defaultValue={
            resource?.content.headers ?? [
              {
                key: "",
                value: "",
              },
            ]
          }
          render={({ field: { value, onChange } }) => (
            <InputRecordEditor
              label={t("editor.action.resource.restapi.label.headers")}
              records={value}
              onAdd={() => {
                onChange([...value, { key: "", value: "" }])
              }}
              onDelete={(index, record) => {
                let newRecords = [...value]
                newRecords.splice(index, 1)
                if (newRecords.length === 0) {
                  newRecords = [{ key: "", value: "" }]
                }
                onChange(newRecords)
              }}
              onChangeKey={(index, key, v) => {
                let newRecords = [...value]
                newRecords[index] = { key, value: v }
                onChange(newRecords)
              }}
              onChangeValue={(index, key, v) => {
                let newRecords = [...value]
                newRecords[index].value = v
                onChange(newRecords)
              }}
            />
          )}
          name="headers"
        />
        <Controller
          control={control}
          defaultValue={
            resource?.content.cookies ?? [
              {
                key: "",
                value: "",
              },
            ]
          }
          render={({ field: { value, onChange } }) => (
            <InputRecordEditor
              label={t("editor.action.resource.restapi.label.cookies")}
              records={value}
              onAdd={() => {
                onChange([...value, { key: "", value: "" }])
              }}
              onDelete={(index, record) => {
                let newRecords = [...value]
                newRecords.splice(index, 1)
                if (newRecords.length === 0) {
                  newRecords = [{ key: "", value: "" }]
                }
                onChange(newRecords)
              }}
              onChangeKey={(index, key, v) => {
                let newRecords = [...value]
                newRecords[index] = { key, value: v }
                onChange(newRecords)
              }}
              onChangeValue={(index, key, v) => {
                let newRecords = [...value]
                newRecords[index].value = v
                onChange(newRecords)
              }}
            />
          )}
          name="cookies"
        />
        <div css={configItem}>
          <div css={labelContainer}>
            <span
              css={applyConfigItemLabelText(getColor("grayBlue", "02"), true)}
            >
              {t("editor.action.resource.restapi.label.authentication")}
            </span>
          </div>
          <Controller
            control={control}
            defaultValue={resource?.content.authentication ?? "none"}
            rules={{
              required: true,
            }}
            render={({ field: { value, onChange, onBlur } }) => (
              <Select
                value={value}
                onBlur={onBlur}
                onChange={(value) => {
                  setAuthType(value)
                  onChange(value)
                }}
                ml="16px"
                mr="24px"
                colorScheme="techPurple"
                options={["none", "basic", "bearer"]}
              />
            )}
            name="authentication"
          />
        </div>
        {authType === "basic" && <BasicAuthPanel control={control} />}
        {authType === "bearer" && <BearerAuthPanel control={control} />}
      </div>
      <div css={footerStyle}>
        <Button
          leftIcon={<PaginationPreIcon />}
          variant="text"
          colorScheme="gray"
          onClick={() => {
            onBack()
          }}
        >
          {t("back")}
        </Button>
        <ButtonGroup spacing="8px">
          <Button
            colorScheme="techPurple"
            value="creating"
            disabled={!formState.isValid}
            loading={saving}
            type="submit"
          >
            {t("editor.action.form.btn.create_resource")}
          </Button>
        </ButtonGroup>
      </div>
    </form>
  )
}

RestApiConfigElement.displayName = "RestApiConfigElement"
