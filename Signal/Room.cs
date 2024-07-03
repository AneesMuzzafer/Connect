using Connect.Utils;

namespace Connect.Signal
{
    public class Room
    {
        public string Id { get; set; }
        public int MeetingId { get; set; }

        public List<Client> Clients { get; set; }

        public Room(string id)
        {
            Id = id;
            Clients = new List<Client>();
        }

        public void SetMeetingId(int meetingId)
        {
            MeetingId = meetingId;
        }

        public void AddClient(Client client)
        {
            Clients.Add(client);
        }

        public void RemoveClient(string connectionId)
        {
            Client client = Clients.Find(c => string.Equals(c.ConnectionId, connectionId));
            Clients.Remove(client);
        }

        public List<Client> GetClientsInRoom()
        {
            return Clients;
        }
    }
}
