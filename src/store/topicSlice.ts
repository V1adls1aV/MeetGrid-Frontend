import {
  createAsyncThunk,
  createSlice,
  PayloadAction,
  ActionReducerMapBuilder,
} from "@reduxjs/toolkit";
import {
  CreatedTopic,
  TopicCreatePayload,
  TopicResponse,
  VotePayload,
  ConstraintsPayload,
} from "../types/topic";
import {
  createTopic as createTopicRequest,
  fetchTopic as fetchTopicRequest,
  saveVote as saveVoteRequest,
  updateConstraints as updateConstraintsRequest,
} from "../services/topicService";

interface TopicFormDraft {
  topicName: string;
  adminName: string;
  description: string;
}

export interface TopicState {
  topic: TopicResponse["topic"] | null;
  stats: TopicResponse["stats"] | null;
  inviteLink: string | null;
  draftConstraints: TopicCreatePayload["constraints"];
  draftForm: TopicFormDraft;
  loading: boolean;
  error: string | null;
}

const buildEmptyDraftForm = (): TopicFormDraft => ({
  topicName: "",
  adminName: "",
  description: "",
});

const initialState: TopicState = {
  topic: null,
  stats: null,
  inviteLink: null,
  draftConstraints: [],
  draftForm: buildEmptyDraftForm(),
  loading: false,
  error: null,
};

const buildError = (value: unknown) =>
  value instanceof Error
    ? value.message
    : typeof value === "string"
      ? value
      : "Неизвестная ошибка";

const createAppThunk = <TResult, TArgs>(
  type: string,
  request: (args: TArgs) => Promise<TResult>,
) =>
  createAsyncThunk<TResult, TArgs, { rejectValue: string }>(
    type,
    async (args, { rejectWithValue }) => {
      try {
        return await request(args);
      } catch (error) {
        return rejectWithValue(buildError(error));
      }
    },
  );

export const createTopicThunk = createAppThunk(
  "topic/create",
  ({ payload, username }: { payload: TopicCreatePayload; username: string }) =>
    createTopicRequest(payload, username),
);

export const fetchTopicThunk = createAppThunk(
  "topic/fetch",
  ({ topicId, username }: { topicId: string; username?: string }) =>
    fetchTopicRequest(topicId, username),
);

export const saveVoteThunk = createAppThunk(
  "topic/save",
  ({
    topicId,
    username,
    payload,
  }: {
    topicId: string;
    username: string;
    payload: VotePayload;
  }) => saveVoteRequest(topicId, username, payload),
);

export const updateConstraintsThunk = createAppThunk(
  "topic/constraints",
  ({
    topicId,
    username,
    payload,
  }: {
    topicId: string;
    username: string;
    payload: ConstraintsPayload;
  }) => updateConstraintsRequest(topicId, username, payload),
);

const topicSlice = createSlice({
  name: "topic",
  initialState,
  reducers: {
    setDraftConstraints(
      state,
      action: { payload: TopicCreatePayload["constraints"] },
    ) {
      state.draftConstraints = action.payload;
    },
    resetDraftConstraints(state) {
      state.draftConstraints = [];
    },
    setDraftForm(state, action: PayloadAction<Partial<TopicFormDraft>>) {
      state.draftForm = { ...state.draftForm, ...action.payload };
    },
    resetDraftForm(state) {
      state.draftForm = buildEmptyDraftForm();
    },
  },
  extraReducers: (builder) => {
    addAsyncCases(builder, createTopicThunk, (state, action) => {
      state.inviteLink = action.payload.invite_link;
      state.draftConstraints = [];
      state.draftForm = buildEmptyDraftForm();
    });
    addAsyncCases(builder, fetchTopicThunk, (state, action) => {
      state.topic = action.payload.topic;
      state.stats = action.payload.stats;
    });
    addAsyncCases(builder, saveVoteThunk, (state, action) => {
      state.topic = action.payload.topic;
      state.stats = action.payload.stats;
    });
    addAsyncCases(builder, updateConstraintsThunk, (state, action) => {
      state.topic = action.payload.topic;
      state.stats = action.payload.stats;
    });
  },
});

const addAsyncCases = (
  builder: ActionReducerMapBuilder<TopicState>,
  thunk: any,
  onFulfilled: (state: TopicState, action: any) => void,
) => {
  builder
    .addCase(thunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(thunk.fulfilled, (state, action) => {
      state.loading = false;
      onFulfilled(state, action);
    })
    .addCase(thunk.rejected, (state, action: any) => {
      state.loading = false;
      state.error = action.payload ?? "Request failed";
    });
};

export const {
  setDraftConstraints,
  resetDraftConstraints,
  setDraftForm,
  resetDraftForm,
} = topicSlice.actions;
export default topicSlice.reducer;
