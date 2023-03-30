import React from 'react';
import _ from 'lodash';
import classnames from 'classnames';
import { BaseGrid, GridHeader } from '@/components';
import { Row, Col } from 'antd';
import { getStylesForTimeCell } from '@/components/BaseGrid/BaseGrid';
import styles from './ScheduleGrid.less';
import { EmployeeSchedule, PlanningProfileSettings, Service } from '@/services/types';
import { GridRow } from '@/utils/helpers';

type ScheduleRecord = {
  isWorking: boolean;
  isBreak: boolean;
  isBreakHalfStart: boolean;
  isBreakHalfEnd: boolean;
};

const filterServices = (serviceList: Service[]) => {
  const sehtestOrBeratungServices = _.intersection(serviceList, [Service.Sehtest, Service.Beratung]);
  if (sehtestOrBeratungServices.length) {
    return sehtestOrBeratungServices.sort((a, b) => b - a);
  }

  return serviceList;
};

const renderServiceList = (serviceList: Service[] = []) => {
  const uniqueServiceList = filterServices(serviceList);
  const visibleServices = [Service.Sehtest, Service.Beratung, Service.Abholung, Service.Services];
  const joinedServices = uniqueServiceList.reduce((joined, curr) => {
    if (visibleServices.includes(+curr)) return joined.concat(` & ${Service[curr]}`);
    return joined;
  }, '');

  const concatenatedServices = joinedServices.substr(3, joinedServices.length) || 'n/a';

  return concatenatedServices;
};

const mapColumms = (
  employeesSchedule: EmployeeSchedule[],
  hideTime: boolean,
  profileSettings: PlanningProfileSettings,
) => {
  const columns = employeesSchedule.map(({ id, firstName, lastName, serviceList, workSchedule }) => ({
    dataIndex: id,
    width: 150,
    title: <GridHeader name={`${firstName} ${lastName}`} description={renderServiceList(serviceList)} />,
    render: (text: ScheduleRecord, record: any) => {
      let { isWorking, isBreak } = text || {};
      const timeCellStyles = getStylesForTimeCell(record.time);
      const { eyetestDuration, autoBreakEnabled } = profileSettings;
      let rangeArray = [0];
      if (eyetestDuration === 10) {
        rangeArray = [0, 10, 20, 30, 40, 50];
      } else if (eyetestDuration === 15) {
        rangeArray = [0, 15, 30, 45];
      } else if (eyetestDuration === 20) {
        rangeArray = [0, 20, 40];
      } else if (eyetestDuration === 30) {
        rangeArray = [0, 30];
      }
      return rangeArray.map((item) => {
        if (workSchedule.length === 2 && autoBreakEnabled) {
          const startMinutes = workSchedule[0].end % 60;
          const endMinutes = workSchedule[1].start % 60;
          const workStartHour = Math.trunc(workSchedule[0].start / 60);
          const workEndHour = Math.trunc(workSchedule[1].end / 60);
          const breakStartHour = Math.trunc(workSchedule[0].end / 60);
          const breakEndHour = Math.trunc(workSchedule[1].start / 60);
          const hour = record.start / 60;
          if (hour >= workStartHour && hour < workEndHour) {
            isWorking = true;
          }
          if (hour === breakStartHour && startMinutes > 0) {
            isBreak = startMinutes <= item;
          } else if (hour === breakEndHour) {
            isBreak = endMinutes > item;
          }
        }
        return (
          <div
            className={classnames(styles.scheduleCell, {
              [timeCellStyles.timeCell]: !hideTime,
              [styles.working]: isWorking,
              [styles.break]: isBreak,
              [styles.notWorking]: !isWorking,
            })}
          >
            &nbsp;
          </div>
        );
      });
    },
  }));

  return columns;
};

const TableTitle = () => (
  <Row className={styles.tableTitle}>
    <Col>
      <h3>Mitarbeiter</h3>
    </Col>
    <Col style={{ position: 'fixed', right: 0, marginRight: 5 }}>
      <Row gutter={16}>
        <Col className={styles.status}>
          <span className={classnames(styles.statusCircle, styles.working)} /> Anwesend
        </Col>
        <Col className={styles.status}>
          <span className={classnames(styles.statusCircle, styles.break)} /> Pause
        </Col>
        <Col className={styles.status}>
          <span className={classnames(styles.statusCircle, styles.notWorking)} /> Abwesenheit
        </Col>
      </Row>
    </Col>
  </Row>
);

interface ScheduleGridProps {
  employeesSchedule: EmployeeSchedule[];
  gridData: GridRow[];
  profileSettings: PlanningProfileSettings;
  hideTime?: boolean;
}

const ScheduleGrid: React.FC<ScheduleGridProps> = ({
  employeesSchedule,
  gridData,
  profileSettings,
  hideTime = false,
}) => {
  return (
    <BaseGrid
      title={TableTitle}
      columns={mapColumms(employeesSchedule, hideTime, profileSettings)}
      dataSource={gridData}
      scroll
    />
  );
};

export default ScheduleGrid;
