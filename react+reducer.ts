import { AppointmentStatus } from '@confidant-health/lib/constants/CommonConstants';
import { IAppointment } from '@confidant-health/lib/ui/templates/appointment-card';
import dayjs from 'dayjs';
import { IAction } from 'redux/store/types';
import {
  CANCEL_APPOINTMENT_SUCCESSFUL,
  CREATE_APPOINTMENT,
  CREATE_APPOINTMENT_FAILED,
  CREATE_APPOINTMENT_SUCCESSFUL,
  CREATE_APPOINTMENT_REQUEST,
  CREATE_APPOINTMENT_REQUEST_FAILED,
  CREATE_APPOINTMENT_REQUEST_SUCCESSFUL,
  FETCH_APPOINTMENTS,
  FETCH_APPOINTMENTS_FAILED,
  FETCH_APPOINTMENTS_SUCCESSFUL,
  FETCH_PROVIDER_SERVICES,
  FETCH_PROVIDER_SERVICES_FAILED,
  FETCH_PROVIDER_SERVICES_SUCCESSFUL,
  FETCH_PROVIDER_ROLES,
  FETCH_PROVIDER_ROLES_SUCCESSFUL,
  FETCH_PROVIDER_ROLES_FAILED,
  RESET_ERROR_MSG,
  UPDATE_APPOINTMENT,
  UPDATE_APPOINTMENT_FAILED,
  UPDATE_APPOINTMENT_SUCCESSFUL,
  FETCH_MASTER_SCHEDULE_REQUEST,
  FETCH_MASTER_SCHEDULE_REQUEST_SUCCESSFUL,
  FETCH_MASTER_SCHEDULE_REQUEST_FAILED,
} from './actions';
import { AppointmentState, IService } from './types';

export const DEFAULT = {
  isLoading: false,
  isRequesting: false,
  errorMsg: '',
  appointments: [] as IAppointment[],
  hasMore: false,
  services: [] as IService[],
  masterSchedule: {
    isLoading: false,
    errorMsg: null,
    masterScheduleItems: [],
  },
  providerRoles: {
    isLoading: false,
    errorMsg: null,
    roles: [],
  },
};

export default function conversationReducer(state = DEFAULT, action: IAction): AppointmentState {
  const { type, payload } = action;

  switch (type) {
    case RESET_ERROR_MSG:
      return {
        ...state,
        errorMsg: '',
      };
    case FETCH_APPOINTMENTS: {
      return {
        ...state,
        isLoading: true,
        isRequesting: false,
        errorMsg: '',
      };
    }
    case FETCH_APPOINTMENTS_FAILED: {
      return {
        ...state,
        isLoading: false,
        appointments: [] as IAppointment[],
      };
    }
    case FETCH_APPOINTMENTS_SUCCESSFUL: {
      return {
        ...state,
        isLoading: false,
        appointments: payload.appointments,
        hasMore: payload.hasMore,
      };
    }
    case FETCH_PROVIDER_SERVICES: {
      return {
        ...state,
        isLoading: true,
      };
    }
    case FETCH_PROVIDER_SERVICES_SUCCESSFUL: {
      return {
        ...state,
        isLoading: false,
        services: payload,
      };
    }
    case FETCH_PROVIDER_SERVICES_FAILED: {
      return {
        ...state,
        isLoading: false,
        services: [],
      };
    }
    case CREATE_APPOINTMENT:
    case UPDATE_APPOINTMENT: {
      return {
        ...state,
        isRequesting: true,
        errorMsg: '',
      };
    }
    case CREATE_APPOINTMENT_FAILED:
    case CREATE_APPOINTMENT_SUCCESSFUL:
    case CREATE_APPOINTMENT_REQUEST:
    case CREATE_APPOINTMENT_REQUEST_FAILED:
    case CREATE_APPOINTMENT_REQUEST_SUCCESSFUL:
    case UPDATE_APPOINTMENT_FAILED:
      return {
        ...state,
        isRequesting: false,
        errorMsg: payload?.message || '',
      };
    case UPDATE_APPOINTMENT_SUCCESSFUL:
      return {
        ...state,
        isRequesting: false,
        appointments: state.appointments.map(item =>
          item.appointmentId === payload.appointmentId ? payload : item,
        ),
        errorMsg: payload?.message || '',
      };
    case CANCEL_APPOINTMENT_SUCCESSFUL: {
      return {
        ...state,
        appointments: state.appointments
          .map(item => {
            if (item.appointmentId === payload.appointmentId) {
              return {
                ...item,
                status: AppointmentStatus.CANCELLED,
              };
            }
            return item;
          })
          .sort((a, b) => dayjs(a.startTime).unix() - dayjs(b.startTime).unix()),
      };
    }
    case FETCH_MASTER_SCHEDULE_REQUEST: {
      return {
        ...state,
        masterSchedule: { ...state.masterSchedule, isLoading: true, errorMsg: null },
      };
    }
    case FETCH_MASTER_SCHEDULE_REQUEST_SUCCESSFUL: {
      return {
        ...state,
        masterSchedule: {
          ...state.masterSchedule,
          isLoading: false,
          masterScheduleItems: payload.masterScheduleItems,
        },
      };
    }
    case FETCH_MASTER_SCHEDULE_REQUEST_FAILED: {
      return {
        ...state,
        masterSchedule: {
          ...state.masterSchedule,
          isLoading: false,
          masterScheduleItems: [],
          errorMsg: payload?.message || '',
        },
      };
    }
    case FETCH_PROVIDER_ROLES: {
      return {
        ...state,
        providerRoles: {
          ...state.providerRoles,
          isLoading: true,
          errorMsg: null,
        },
      };
    }
    case FETCH_PROVIDER_ROLES_SUCCESSFUL: {
      return {
        ...state,
        providerRoles: {
          ...state.providerRoles,
          isLoading: false,
          roles: payload.providerRoles,
        },
      };
    }
    case FETCH_PROVIDER_ROLES_FAILED: {
      return {
        ...state,
        providerRoles: {
          ...state.providerRoles,
          isLoading: false,
          roles: [],
        },
      };
    }
    default: {
      return state;
    }
  }
}
