using Connect.Data;
using Connect.Models;
using Connect.Signal;
using Connect.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using System.Security.Claims;

namespace Connect.Controllers
{
    [Authorize]
    public class ConnectController : Controller
    {
        private readonly RoomManager _roomManager;
        private readonly ApplicationDbContext _context;

        public ConnectController(RoomManager roomManager, ApplicationDbContext context)
        {
            _roomManager = roomManager;
            _context = context;
        }

        [Route("/Connect")]
        public IActionResult Index()
        {
            return View("Invalid");
        }

        [Route("/Connect/{roomId}")]
        public async Task<IActionResult> Meeting(string roomId)
        {
            if (!_roomManager.RoomExist(roomId))
            {
                return View("Invalid");
            }

            return View("Index", roomId);
        }

        [Route("/Start")]
        public async Task<IActionResult> Start()
        {
            string newRoomId = RoomIdGenerator.Create();
            Room newRoom = new Room(newRoomId);
            _roomManager.AddRoom(newRoom);

            var meeting = new Meeting
            {
                RoomId = newRoomId,
                StartedAt = DateTime.Now,
                UserId = User.FindFirstValue(ClaimTypes.NameIdentifier)
            };

            _context.Meetings.Add(meeting);
            await _context.SaveChangesAsync();

            newRoom.SetMeetingId(meeting.Id);

            return Redirect($"/Connect/{newRoomId}");
        }
    }
}
