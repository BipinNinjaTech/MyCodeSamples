import React, { useEffect, useState, useCallback } from "react";
import {
  Breadcrumb,
  Select,
  Radio,
  Form,
  Row,
  Col,
  Button,
  Checkbox,
  TimePicker,
  DatePicker,
  message,
  Spin,
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router";
import moment from "moment";
import { getDoctors, getSchedule, updateSchedule } from "../../services/doctor";
import { isEmpty } from "lodash";

const { Option } = Select;

const DoctorSchedule = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const [doctors, setDoctors] = useState([]);
  const [doctorSchedule, setDoctorSchedule] = useState(null);
  const [doctorId, setDoctorId] = useState(null);
  const [updatedSchedule, setUpdateSchedule] = useState([]);
  const [specificDate, setSpecificDate] = useState("");
  const [specificDateHoliday, setSpecificDateHoliday] = useState(false);
  const [weekRadio, setWeekRadio] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getDoctors();
      setDoctors(data);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (location?.state?.doctorId) {
      setDoctorId(location?.state?.doctorId);
      onChangeDoctor(location?.state?.doctorId);
    }
  }, [location?.state?.doctorId]);

  const onChangeDoctor = useCallback(
    async (value) => {
      if (value) {
        if (!isEmpty(doctorSchedule)) {
          form.resetFields();
          setSpecificDate("");
          setWeekRadio(null);
        }
        const scheduleData = await getSchedule(value);
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const defaultSchedules = days.map((day) => ({
          day,
          holiday: false,
          interval: null,
          schedule: null,
        }));

        (scheduleData?.schedules ?? defaultSchedules)?.forEach((schedule) =>
          form.setFieldsValue({
            [schedule.day]: {
              holiday: schedule?.holiday,
              interval: schedule?.interval,
              schedule: schedule?.schedule?.map((item) => ({
                start_time: moment(item.start_time, "HH:mm:ss"),
                end_time: moment(item.end_time, "HH:mm:ss"),
              })),
            },
          })
        );
        setDoctorSchedule(scheduleData);
        setUpdateSchedule(scheduleData?.schedules ?? defaultSchedules);
      }
    },
    [doctorId]
  );

  const onChangeWeek = (e) => {
    const fields = form.getFieldsValue();
    e.target.value === "allWeek"
      ? updatedSchedule?.forEach((schedule) =>
          form.setFieldsValue({
            [schedule.day]: {
              holiday: fields.Mon.holiday,
              interval: fields.Mon.interval,
              schedule: fields.Mon.schedule,
            },
          })
        )
      : updatedSchedule.slice(0, -2).forEach((schedule) =>
          form.setFieldsValue({
            [schedule.day]: {
              holiday: fields.Mon.holiday,
              interval: fields.Mon.interval,
              schedule: fields.Mon.schedule,
            },
          })
        );
    setWeekRadio(e.target.value);
  };

  const onChangeHoliday = (e, day) => {
    const schedules = updatedSchedule?.map((schedule) =>
      schedule.day === day
        ? { ...schedule, holiday: e.target.checked }
        : schedule
    );
    setUpdateSchedule(schedules);
  };

  const onChangeSpecificDate = (e, dateString) => {
    const dateAvailable = doctorSchedule?.specificDate?.find(
      (schedule) => schedule.date === dateString
    );
    dateAvailable &&
      form.setFieldsValue({
        specificDate: {
          holiday: dateAvailable.holiday,
          interval: dateAvailable?.interval,
          schedule: dateAvailable?.schedule?.map((item) => ({
            start_time: moment(item.start_time, "HH:mm:ss"),
            end_time: moment(item.end_time, "HH:mm:ss"),
          })),
        },
      });
    setSpecificDate(dateString);
  };

  const onChangeSpecificDateHoliday = (e) => {
    setSpecificDateHoliday(e.target.checked);
  };

  const onsubmitHandler = async (values) => {
    setLoading(true);
    let finalSpecificDate = [];
    const finalSchedules = (doctorSchedule?.schedules ?? updatedSchedule)?.map(
      (schedule) => {
        const holiday = values[schedule.day].holiday;
        return {
          day: schedule.day,
          holiday,
          interval: holiday ? null : values[schedule.day].interval,
          schedule: holiday
            ? null
            : values[schedule.day]?.schedule?.map((item) => ({
                start_time: moment(item.start_time).format("HH:mm:ss"),
                end_time: moment(item.end_time).format("HH:mm:ss"),
              })),
        };
      }
    );

    const dateAvailable = doctorSchedule?.specificDate?.find(
      (item) => item.date === specificDate
    );

    if (values?.specificDate) {
      const holiday = values?.specificDate.holiday;
      const updatedSpecificDate = {
        date: specificDate,
        holiday: holiday,
        interval: holiday ? null : values?.specificDate?.interval,
        schedule: holiday
          ? null
          : values?.specificDate?.schedule?.map((item) => ({
              start_time: moment(item.start_time).format("HH:mm:ss"),
              end_time: moment(item.end_time).format("HH:mm:ss"),
            })),
      };
      if (dateAvailable) {
        finalSpecificDate = doctorSchedule?.specificDate?.map((item) =>
          item.date === dateAvailable.date ? updatedSpecificDate : item
        );
      } else {
        const newSpecificDate = [];
        (doctorSchedule?.specificDate ?? newSpecificDate)?.push(
          updatedSpecificDate
        );
        finalSpecificDate = doctorSchedule?.specificDate ?? newSpecificDate;
      }
    } else {
      finalSpecificDate = doctorSchedule?.specificDate;
    }

    const finalData = {
      id: doctorSchedule.id,
      schedules: finalSchedules,
      specificDate: finalSpecificDate,
      status: doctorSchedule.status,
      message: doctorSchedule.message,
    };

    const response = await updateSchedule(finalData);
    setLoading(false);
    response.status === "success"
      ? message.success("Schedule updated successfully")
      : message.error("Someting went wrong!!");
  };

  return (
    <div className="container">
      {loading ? (
        <Spin size="large" tip="Loading..." />
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h2>Doctor Schedule</h2>
            <Breadcrumb separator=">">
              <Breadcrumb.Item
                onClick={() => navigate("/")}
                style={{ cursor: "pointer" }}
              >
                Dashboard
              </Breadcrumb.Item>
              <Breadcrumb.Item>Users Management</Breadcrumb.Item>
              <Breadcrumb.Item>Doctor Schedule</Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Select
              placeholder="Select a doctor"
              onChange={(value) => {
                setDoctorId(value);
                onChangeDoctor(value);
              }}
              value={doctorId}
              style={{ width: 240 }}
            >
              {doctors.map((doctor) => (
                <Option value={doctor.doctorId} key={doctor.doctorId}>
                  {doctor.fullname}
                </Option>
              ))}
            </Select>
          </div>
          <Form
            form={form}
            name="basic"
            initialValues={{
              remember: false,
            }}
            onFinish={onsubmitHandler}
            autoComplete="off"
            style={{ margin: "1rem 0" }}
          >
            {!isEmpty(doctorSchedule) && (
              <>
                <Row style={{ marginBottom: "1rem" }}>
                  <Radio.Group
                    onChange={onChangeWeek}
                    value={weekRadio}
                    style={{ marginTop: "1.5rem" }}
                  >
                    <Radio value="allWeek">All Week</Radio>
                    <Radio value="workWeek">Work Week</Radio>
                  </Radio.Group>
                </Row>
                <Row gutter={[24, 24]}>
                  {updatedSchedule?.map((schedule) => {
                    const fields = form.getFieldValue();
                    return (
                      <Col span={12} key={schedule.day}>
                        <h3 style={{ fontWeight: 600 }}>{schedule.day}</h3>
                        <Row>
                          <Col span={12}>
                            <Form.Item
                              name={[schedule.day, "holiday"]}
                              valuePropName="checked"
                              initialValue={schedule.holiday}
                            >
                              <Checkbox
                                onChange={(e) =>
                                  onChangeHoliday(e, schedule.day)
                                }
                              >
                                Holiday
                              </Checkbox>
                            </Form.Item>
                          </Col>
                          {!fields[schedule.day].holiday && (
                            <>
                              <Col span={12}>
                                <Form.Item
                                  name={[schedule.day, "interval"]}
                                  label="Meeting Interval"
                                  rules={[
                                    {
                                      required: !fields[schedule.day].holiday,
                                      message:
                                        "Meeting interval cannot be blank.",
                                    },
                                  ]}
                                  initialValue={schedule.interval}
                                >
                                  <Select placeholder="Interval" required>
                                    <Option value="15">15</Option>
                                    <Option value="30">30</Option>
                                    <Option value="45">45</Option>
                                    <Option value="60">60</Option>
                                  </Select>
                                </Form.Item>
                              </Col>
                              <Col>
                                <Form.List
                                  name={[schedule.day, "schedule"]}
                                  initialValue={schedule?.schedule?.map(
                                    (item) => ({
                                      start_time: moment(
                                        item.start_time,
                                        "HH:mm:ss"
                                      ),
                                      end_time: moment(
                                        item.end_time,
                                        "HH:mm:ss"
                                      ),
                                    })
                                  )}
                                  rules={[
                                    {
                                      validator: async (_, schedule) => {
                                        if (!schedule || schedule.length < 1) {
                                          return Promise.reject(
                                            new Error(
                                              "At least 1 schedule required"
                                            )
                                          );
                                        }
                                      },
                                    },
                                  ]}
                                >
                                  {(schedule, { add, remove }, { errors }) => (
                                    <>
                                      {schedule.map((field, index) => (
                                        <Form.Item required={false} key={index}>
                                          <Row gutter={[48, 24]}>
                                            <Col span={10}>
                                              <Form.Item
                                                name={[index, `start_time`]}
                                                label="From"
                                                rules={[
                                                  {
                                                    required: true,
                                                    message: "Required",
                                                  },
                                                ]}
                                              >
                                                <TimePicker />
                                              </Form.Item>
                                            </Col>
                                            <Col span={10}>
                                              <Form.Item
                                                name={[index, `end_time`]}
                                                label="To"
                                                rules={[
                                                  {
                                                    required: true,
                                                    message: "Required",
                                                  },
                                                ]}
                                              >
                                                <TimePicker />
                                              </Form.Item>
                                            </Col>
                                            <Col>
                                              {schedule.length > 1 ? (
                                                <MinusCircleOutlined
                                                  className="dynamic-delete-button"
                                                  onClick={() =>
                                                    remove(field.name)
                                                  }
                                                />
                                              ) : null}
                                            </Col>
                                          </Row>
                                        </Form.Item>
                                      ))}
                                      <Row>
                                        <Form.Item>
                                          <Button
                                            type="dashed"
                                            onClick={() => add()}
                                            icon={<PlusOutlined />}
                                          >
                                            Add field
                                          </Button>
                                          <Form.ErrorList errors={errors} />
                                        </Form.Item>
                                      </Row>
                                    </>
                                  )}
                                </Form.List>
                              </Col>
                            </>
                          )}
                        </Row>
                      </Col>
                    );
                  })}
                </Row>
                <Row style={{ marginBottom: "1rem", flexDirection: "column" }}>
                  <Col style={{ fontWeight: 600, marginBottom: "1rem" }}>
                    Specific Date
                  </Col>
                  <Col>
                    <DatePicker
                      onChange={onChangeSpecificDate}
                      value={
                        specificDate ? moment(specificDate, "YYYY-MM-DD") : ""
                      }
                    />
                  </Col>
                  {specificDate && (
                    <>
                      <Row style={{ marginTop: "1rem" }}>
                        <Col span={6}>
                          <Form.Item
                            name={["specificDate", "holiday"]}
                            valuePropName="checked"
                            initialValue={specificDateHoliday}
                          >
                            <Checkbox onChange={onChangeSpecificDateHoliday}>
                              Holiday
                            </Checkbox>
                          </Form.Item>
                        </Col>
                        {!specificDateHoliday && (
                          <Col>
                            <Form.Item
                              name={["specificDate", "interval"]}
                              label="Meeting Interval"
                              rules={[
                                {
                                  required: true,
                                  message: "Meeting interval cannot be blank.",
                                },
                              ]}
                            >
                              <Select placeholder="Interval" required>
                                <Option value="15">15</Option>
                                <Option value="30">30</Option>
                                <Option value="45">45</Option>
                                <Option value="60">60</Option>
                              </Select>
                            </Form.Item>
                          </Col>
                        )}
                      </Row>
                      {!specificDateHoliday && (
                        <Form.List
                          name={["specificDate", "schedule"]}
                          rules={[
                            {
                              validator: async (_, schedule) => {
                                if (!schedule || schedule.length < 1) {
                                  return Promise.reject(
                                    new Error("At least 1 schedule required")
                                  );
                                }
                              },
                            },
                          ]}
                        >
                          {(schedule, { add, remove }, { errors }) => (
                            <>
                              {schedule.map((field, index) => (
                                <Form.Item required={false} key={index}>
                                  <Row gutter={[48, 24]}>
                                    <Col span={6}>
                                      <Form.Item
                                        name={[index, `start_time`]}
                                        label="From"
                                        rules={[
                                          {
                                            required: true,
                                            message: "Required",
                                          },
                                        ]}
                                      >
                                        <TimePicker />
                                      </Form.Item>
                                    </Col>
                                    <Col span={5}>
                                      <Form.Item
                                        name={[index, `end_time`]}
                                        label="To"
                                        rules={[
                                          {
                                            required: true,
                                            message: "Required",
                                          },
                                        ]}
                                      >
                                        <TimePicker />
                                      </Form.Item>
                                    </Col>
                                    <Col>
                                      {schedule.length > 1 ? (
                                        <MinusCircleOutlined
                                          className="dynamic-delete-button"
                                          onClick={() => remove(field.name)}
                                        />
                                      ) : null}
                                    </Col>
                                  </Row>
                                </Form.Item>
                              ))}
                              <Row>
                                <Form.Item>
                                  <Button
                                    type="dashed"
                                    onClick={() => add()}
                                    icon={<PlusOutlined />}
                                  >
                                    Add field
                                  </Button>
                                  <Form.ErrorList errors={errors} />
                                </Form.Item>
                              </Row>
                            </>
                          )}
                        </Form.List>
                      )}
                    </>
                  )}
                </Row>
                <Row>
                  <Form.Item>
                    <div style={{ display: "flex" }}>
                      <div className="orange-btn">
                        <Button type="primary" htmlType="submit">
                          Save
                        </Button>
                      </div>
                    </div>
                  </Form.Item>
                </Row>
              </>
            )}
          </Form>
        </>
      )}
    </div>
  );
};

export default DoctorSchedule;
