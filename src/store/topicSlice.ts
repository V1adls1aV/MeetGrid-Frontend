import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
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

export const createTopicThunk = createAsyncThunk<
  CreatedTopic,
  { payload: TopicCreatePayload; username: string },
  { rejectValue: string }
>("topic/create", async ({ payload, username }, { rejectWithValue }) => {
  try {
    return await createTopicRequest(payload, username);
  } catch (error) {
    return rejectWithValue(buildError(error));
  }
});

export const fetchTopicThunk = createAsyncThunk<
  TopicResponse,
  { topicId: string; username?: string },
  { rejectValue: string }
>("topic/fetch", async ({ topicId, username }, { rejectWithValue }) => {
  try {
    return await fetchTopicRequest(topicId, username);
  } catch (error) {
    return rejectWithValue(buildError(error));
  }
});

export const saveVoteThunk = createAsyncThunk<
  TopicResponse,
  { topicId: string; username: string; payload: VotePayload },
  { rejectValue: string }
>("topic/save", async ({ topicId, username, payload }, { rejectWithValue }) => {
  try {
    return await saveVoteRequest(topicId, username, payload);
  } catch (error) {
    return rejectWithValue(buildError(error));
  }
});

export const updateConstraintsThunk = createAsyncThunk<
  TopicResponse,
  { topicId: string; username: string; payload: ConstraintsPayload },
  { rejectValue: string }
>(
  "topic/constraints",
  async ({ topicId, username, payload }, { rejectWithValue }) => {
    try {
      return await updateConstraintsRequest(topicId, username, payload);
    } catch (error) {
      return rejectWithValue(buildError(error));
    }
  },
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
  extraReducers: (builder) =>
    builder
      .addCase(createTopicThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTopicThunk.fulfilled, (state, action) => {
        state.inviteLink = action.payload.invite_link;
        state.draftConstraints = [];
        state.draftForm = buildEmptyDraftForm();
        state.loading = false;
      })
      .addCase(createTopicThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Ошибка создания темы";
      })
      .addCase(fetchTopicThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTopicThunk.fulfilled, (state, action) => {
        state.topic = action.payload.topic;
        state.stats = action.payload.stats;
        state.loading = false;
      })
      .addCase(fetchTopicThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Ошибка загрузки темы";
      })
      .addCase(saveVoteThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveVoteThunk.fulfilled, (state, action) => {
        state.topic = action.payload.topic;
        state.stats = action.payload.stats;
        state.loading = false;
      })
      .addCase(saveVoteThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Ошибка сохранения голосов";
      })
      .addCase(updateConstraintsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateConstraintsThunk.fulfilled, (state, action) => {
        state.topic = action.payload.topic;
        state.stats = action.payload.stats;
        state.loading = false;
      })
      .addCase(updateConstraintsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Ошибка обновления ограничений";
      }),
});

export const {
  setDraftConstraints,
  resetDraftConstraints,
  setDraftForm,
  resetDraftForm,
} = topicSlice.actions;
export default topicSlice.reducer;
