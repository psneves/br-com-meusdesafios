import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useExplore } from "../../src/hooks/use-explore";
import { UserAvatar } from "../../src/components/UserAvatar";
import { Toast } from "../../src/components/Toast";
import { colors } from "../../src/theme/colors";
import { spacing } from "../../src/theme/spacing";
import { typography } from "../../src/theme/typography";
import type {
  ExploreUser,
  FriendSummary,
  PendingFollowRequest,
  SentFollowRequest,
} from "@meusdesafios/shared";

export default function ExploreScreen() {
  const {
    pendingRequests,
    sentRequests,
    suggestedUsers,
    friends,
    searchResults,
    isLoading,
    isSearching,
    error,
    search,
    clearSearch,
    sendFollowRequest,
    acceptRequest,
    denyRequest,
    cancelRequest,
    unfriend,
    feedback,
    clearFeedback,
    refresh,
  } = useExplore();

  const [searchText, setSearchText] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    refresh();
    // Give the effect time to re-fetch
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
    search(text);
  };

  const handleClearSearch = () => {
    setSearchText("");
    clearSearch();
  };

  const handleUnfriend = (userId: string, name: string) => {
    Alert.alert(
      "Desfazer amizade",
      `Tem certeza que deseja desfazer a amizade com ${name}?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Desfazer", style: "destructive", onPress: () => unfriend(userId) },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  const displayUsers = searchResults ?? suggestedUsers;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Toast
        message={feedback?.message ?? null}
        variant={feedback?.variant}
        onDismiss={clearFeedback}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary[500]}
          />
        }
      >
        {/* Search bar */}
        <View style={styles.searchRow}>
          <Ionicons name="search" size={18} color={colors.gray[400]} />
          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={handleSearch}
            placeholder="Buscar por nome ou @handle"
            placeholderTextColor={colors.gray[400]}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchText.length > 0 && (
            <Pressable onPress={handleClearSearch}>
              <Ionicons name="close-circle" size={18} color={colors.gray[400]} />
            </Pressable>
          )}
          {isSearching && (
            <ActivityIndicator size="small" color={colors.primary[500]} />
          )}
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        {/* Pending requests */}
        {pendingRequests.length > 0 && !searchResults && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Solicitações pendentes ({pendingRequests.length})
            </Text>
            {pendingRequests.map((req) => (
              <PendingRequestRow
                key={req.edgeId}
                request={req}
                onAccept={acceptRequest}
                onDeny={denyRequest}
              />
            ))}
          </View>
        )}

        {/* Sent requests */}
        {sentRequests.length > 0 && !searchResults && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Enviadas ({sentRequests.length})
            </Text>
            {sentRequests.map((req) => (
              <SentRequestRow
                key={req.edgeId}
                request={req}
                onCancel={cancelRequest}
              />
            ))}
          </View>
        )}

        {/* Friends */}
        {friends.length > 0 && !searchResults && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Amigos ({friends.length})
            </Text>
            {friends.map((friend) => (
              <FriendRow
                key={friend.id}
                friend={friend}
                onUnfriend={handleUnfriend}
              />
            ))}
          </View>
        )}

        {/* Suggested / Search results */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {searchResults ? "Resultados" : "Sugestões"}
          </Text>
          {displayUsers.length === 0 ? (
            <Text style={styles.emptyText}>
              {searchResults ? "Nenhum resultado encontrado" : "Nenhuma sugestão"}
            </Text>
          ) : (
            displayUsers.map((user) => (
              <ExploreUserRow
                key={user.handle}
                user={user}
                onFollow={sendFollowRequest}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function PendingRequestRow({
  request,
  onAccept,
  onDeny,
}: {
  request: PendingFollowRequest;
  onAccept: (edgeId: string) => void;
  onDeny: (edgeId: string) => void;
}) {
  return (
    <View style={styles.userRow}>
      <UserAvatar
        avatarUrl={request.avatarUrl}
        displayName={request.displayName}
        size="md"
      />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{request.displayName}</Text>
        <Text style={styles.userHandle}>@{request.handle}</Text>
      </View>
      <View style={styles.actionButtons}>
        <Pressable
          style={styles.acceptButton}
          onPress={() => onAccept(request.edgeId)}
        >
          <Text style={styles.acceptButtonText}>Aceitar</Text>
        </Pressable>
        <Pressable
          style={styles.denyButton}
          onPress={() => onDeny(request.edgeId)}
        >
          <Ionicons name="close" size={16} color={colors.gray[500]} />
        </Pressable>
      </View>
    </View>
  );
}

function SentRequestRow({
  request,
  onCancel,
}: {
  request: SentFollowRequest;
  onCancel: (edgeId: string) => void;
}) {
  return (
    <View style={styles.userRow}>
      <UserAvatar
        avatarUrl={request.avatarUrl}
        displayName={request.displayName}
        size="md"
      />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{request.displayName}</Text>
        <Text style={styles.userHandle}>@{request.handle}</Text>
      </View>
      <Pressable
        style={styles.cancelButton}
        onPress={() => onCancel(request.edgeId)}
      >
        <Text style={styles.cancelButtonText}>Cancelar</Text>
      </Pressable>
    </View>
  );
}

function FriendRow({
  friend,
  onUnfriend,
}: {
  friend: FriendSummary;
  onUnfriend: (userId: string, name: string) => void;
}) {
  return (
    <View style={styles.userRow}>
      <UserAvatar
        avatarUrl={friend.avatarUrl}
        displayName={friend.displayName}
        size="md"
      />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{friend.displayName}</Text>
        <Text style={styles.userHandle}>@{friend.handle}</Text>
      </View>
      <Pressable
        style={styles.unfriendButton}
        onPress={() => onUnfriend(friend.id, friend.displayName)}
      >
        <Ionicons name="person-remove-outline" size={16} color={colors.error} />
      </Pressable>
    </View>
  );
}

function ExploreUserRow({
  user,
  onFollow,
}: {
  user: ExploreUser;
  onFollow: (handle: string) => void;
}) {
  const isPending = user.followStatus === "pending";
  const isFriend = user.followStatus === "accepted";

  return (
    <View style={styles.userRow}>
      <UserAvatar
        avatarUrl={user.avatarUrl}
        displayName={user.displayName}
        size="md"
      />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{user.displayName}</Text>
        <Text style={styles.userHandle}>@{user.handle}</Text>
      </View>
      {isFriend ? (
        <View style={styles.friendBadge}>
          <Ionicons name="checkmark" size={14} color={colors.success} />
          <Text style={styles.friendBadgeText}>Amigo</Text>
        </View>
      ) : isPending ? (
        <View style={styles.pendingBadge}>
          <Text style={styles.pendingBadgeText}>Pendente</Text>
        </View>
      ) : (
        <Pressable
          style={styles.followButton}
          onPress={() => onFollow(user.handle)}
        >
          <Text style={styles.followButtonText}>Adicionar</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  content: {
    padding: spacing.phi4,
    paddingBottom: spacing.phi7,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.gray[50],
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingHorizontal: spacing.phi3,
    paddingVertical: spacing.phi2,
    gap: spacing.phi2,
    marginBottom: spacing.phi4,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.gray[900],
    paddingVertical: spacing.phi1,
  },
  error: {
    ...typography.bodySmall,
    color: colors.error,
    textAlign: "center",
    marginBottom: spacing.phi3,
  },
  section: {
    marginBottom: spacing.phi4,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.gray[800],
    marginBottom: spacing.phi3,
  },
  emptyText: {
    ...typography.body,
    color: colors.gray[400],
    textAlign: "center",
    paddingVertical: spacing.phi4,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: spacing.phi3,
    marginBottom: spacing.phi2,
    gap: spacing.phi3,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...typography.body,
    color: colors.gray[900],
    fontWeight: "600",
  },
  userHandle: {
    ...typography.caption,
    color: colors.gray[500],
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.phi2,
  },
  acceptButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.phi3,
    paddingVertical: spacing.phi2,
    borderRadius: 8,
  },
  acceptButtonText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: "600",
  },
  denyButton: {
    padding: spacing.phi2,
    borderRadius: 8,
    backgroundColor: colors.gray[100],
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    paddingHorizontal: spacing.phi3,
    paddingVertical: spacing.phi2,
    borderRadius: 8,
  },
  cancelButtonText: {
    ...typography.caption,
    color: colors.gray[600],
    fontWeight: "600",
  },
  unfriendButton: {
    padding: spacing.phi2,
  },
  followButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.phi3,
    paddingVertical: spacing.phi2,
    borderRadius: 8,
  },
  followButtonText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: "600",
  },
  friendBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.phi1,
  },
  friendBadgeText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: "600",
  },
  pendingBadge: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    paddingHorizontal: spacing.phi3,
    paddingVertical: spacing.phi2,
    borderRadius: 8,
  },
  pendingBadgeText: {
    ...typography.caption,
    color: colors.gray[500],
    fontWeight: "600",
  },
});
